import os
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

from .preprocessing import load_and_preprocess_data, save_scaler
from .lstm_model import build_lstm_model


def train_and_evaluate(csv_path, model_path, scaler_path, epochs=50, batch_size=32, seq_length=24):
    """Full pipeline to train the LSTM model and save it."""
    print(f"Loading data from {csv_path}...")
    X, y, scaler, df = load_and_preprocess_data(csv_path, seq_length=seq_length)

    # Split into train (80%) and test (20%)
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print(f"Training data shape: {X_train.shape}")
    print("Building model...")
    model = build_lstm_model((X_train.shape[1], X_train.shape[2]))

    print("Training model...")
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.1,
        verbose=1
    )

    print("Evaluating model...")
    predictions = model.predict(X_test)

    # Inverse transform predictions and actuals for correct metrics calculation
    # We only need to invert the target column (consumption_kwh), which is index 0
    pred_full = np.zeros((len(predictions), X.shape[2]))
    pred_full[:, 0] = predictions[:, 0]
    inv_predictions = scaler.inverse_transform(pred_full)[:, 0]

    y_test_full = np.zeros((len(y_test), X.shape[2]))
    y_test_full[:, 0] = y_test
    inv_y_test = scaler.inverse_transform(y_test_full)[:, 0]

    rmse = np.sqrt(mean_squared_error(inv_y_test, inv_predictions))
    mae = mean_absolute_error(inv_y_test, inv_predictions)
    mape = np.mean(np.abs((inv_y_test - inv_predictions) / inv_y_test)) * 100

    print(f"Validation Results: RMSE={rmse:.2f}, MAE={mae:.2f}, MAPE={mape:.2f}%")

    print(f"Saving model to {model_path} and scaler to {scaler_path}...")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save(model_path)
    save_scaler(scaler, scaler_path)

    return rmse, mae, mape
