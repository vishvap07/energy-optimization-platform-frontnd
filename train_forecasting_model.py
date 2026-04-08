"""
Standalone Training Script for Energy Forecasting LSTM Model
============================================================
Generates synthetic energy consumption data and trains the LSTM model.
Saves model + scaler to ml_models/saved_models/.
"""

import os
import sys
import math
import random
import numpy as np
import pandas as pd
import joblib

from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error

# ──────────────────────────────────────────────────────────────────────────────
# 1. Synthetic Data Generation
# ──────────────────────────────────────────────────────────────────────────────

def generate_synthetic_data(num_months: int = 12, seed: int = 42) -> pd.DataFrame:
    """
    Generate realistic hourly energy consumption data with:
    - Diurnal load profile (morning + evening peaks)
    - Weekly seasonality (weekends are lower)
    - Temperature-driven variation
    - Random anomaly spikes
    - Gaussian noise
    """
    random.seed(seed)
    np.random.seed(seed)

    hours_per_day = 24
    days = num_months * 30
    total_records = days * hours_per_day

    start_date = datetime(2024, 1, 1)
    records = []
    anomaly_indices = set(random.sample(range(total_records), max(1, total_records // 400)))

    # Simulate a sinusoidal seasonal temperature (colder in Jan/Jul, warmer mid-year)
    for i in range(total_records):
        current_time = start_date + timedelta(hours=i)
        hour = current_time.hour
        weekday = current_time.weekday()  # 0=Mon … 6=Sun
        day_of_year = (current_time - start_date).days

        # ── Diurnal profile ──
        base_load = 30.0
        morning_peak = 25.0 * math.exp(-0.25 * (hour - 9) ** 2)
        evening_peak = 40.0 * math.exp(-0.18 * (hour - 19) ** 2)

        # ── Weekend reduction ──
        weekend_factor = 0.75 if weekday >= 5 else 1.0

        # ── Seasonal temperature (sinusoidal, peaks in June/July) ──
        temp = 22.0 + 12.0 * math.sin(2 * math.pi * (day_of_year - 60) / 365)
        temp += random.gauss(0, 1.5)
        temp = round(max(5.0, min(42.0, temp)), 1)

        # ── Temperature-driven extra load (AC/heating effect) ──
        temp_effect = max(0, (temp - 25.0) * 1.2) + max(0, (15.0 - temp) * 0.8)

        demand_kw = (base_load + morning_peak + evening_peak) * weekend_factor + temp_effect
        demand_kw += random.gauss(0, 3.0)

        # ── Anomaly injection ──
        if i in anomaly_indices:
            demand_kw += random.uniform(70.0, 160.0)

        demand_kw = round(max(10.0, demand_kw), 2)

        # ── Derived electrical quantities ──
        consumption_kwh = round(demand_kw * random.uniform(0.92, 1.08), 2)
        power_factor = round(
            max(0.82, min(0.99, random.uniform(0.90, 0.99) - demand_kw * 0.0004)), 3
        )
        voltage = round(random.uniform(224.0, 236.0), 1)
        current = round((demand_kw * 1000) / (voltage * power_factor), 1)

        records.append({
            "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "consumption_kwh": consumption_kwh,
            "demand_kw": demand_kw,
            "voltage": voltage,
            "current": current,
            "power_factor": power_factor,
            "temperature": temp,
        })

    df = pd.DataFrame(records)
    print(f"  Generated {len(df):,} synthetic hourly records  "
          f"({num_months} months, {len(anomaly_indices)} anomalies injected)")
    return df


# ──────────────────────────────────────────────────────────────────────────────
# 2. Preprocessing
# ──────────────────────────────────────────────────────────────────────────────

FEATURES = ["consumption_kwh", "demand_kw", "temperature"]
SEQ_LENGTH = 24  # 24-hour look-back window


def preprocess(df: pd.DataFrame, seq_length: int = SEQ_LENGTH):
    df = df.sort_values("timestamp").reset_index(drop=True)
    data = df[FEATURES].values

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(data)

    X, y = [], []
    for i in range(len(scaled) - seq_length):
        X.append(scaled[i : i + seq_length])
        y.append(scaled[i + seq_length, 0])  # predict consumption_kwh

    return np.array(X), np.array(y), scaler


# ──────────────────────────────────────────────────────────────────────────────
# 3. LSTM Model
# ──────────────────────────────────────────────────────────────────────────────

def build_model(input_shape):
    """Stacked LSTM with dropout regularisation."""
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout

    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1),
    ])
    model.compile(optimizer="adam", loss="mean_squared_error", metrics=["mae"])
    return model


# ──────────────────────────────────────────────────────────────────────────────
# 4. Training & Evaluation
# ──────────────────────────────────────────────────────────────────────────────

def train(
    df: pd.DataFrame,
    model_save_path: str,
    scaler_save_path: str,
    epochs: int = 20,
    batch_size: int = 64,
):
    import tensorflow as tf
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

    print("\n── Preprocessing ─────────────────────────────────────────────────")
    X, y, scaler = preprocess(df)
    print(f"  Sequences: {X.shape}  |  Targets: {y.shape}")

    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    print(f"  Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    print("\n── Building Model ────────────────────────────────────────────────")
    model = build_model((X_train.shape[1], X_train.shape[2]))
    model.summary()

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, verbose=1),
    ]

    print(f"\n── Training (max {epochs} epochs, batch={batch_size}) ─────────────")
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.1,
        callbacks=callbacks,
        verbose=1,
    )

    print("\n── Evaluation ────────────────────────────────────────────────────")
    predictions = model.predict(X_test, verbose=0)

    # Inverse-transform to original scale
    num_features = X.shape[2]
    pred_full = np.zeros((len(predictions), num_features))
    pred_full[:, 0] = predictions[:, 0]
    inv_pred = scaler.inverse_transform(pred_full)[:, 0]

    y_test_full = np.zeros((len(y_test), num_features))
    y_test_full[:, 0] = y_test
    inv_y = scaler.inverse_transform(y_test_full)[:, 0]

    rmse = math.sqrt(mean_squared_error(inv_y, inv_pred))
    mae  = mean_absolute_error(inv_y, inv_pred)
    mape = float(np.mean(np.abs((inv_y - inv_pred) / np.where(inv_y == 0, 1e-6, inv_y))) * 100)

    print(f"  RMSE : {rmse:.4f} kWh")
    print(f"  MAE  : {mae:.4f} kWh")
    print(f"  MAPE : {mape:.2f} %")

    # ── Save artefacts ──
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    model.save(model_save_path)
    joblib.dump(scaler, scaler_save_path)
    print(f"\n  Model  saved → {model_save_path}")
    print(f"  Scaler saved → {scaler_save_path}")

    return {"rmse": rmse, "mae": mae, "mape": mape, "epochs_run": len(history.history["loss"])}


# ──────────────────────────────────────────────────────────────────────────────
# 5. Entry Point
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH  = os.path.join(BASE_DIR, "ml_models", "saved_models", "lstm_model.h5")
    SCALER_PATH = os.path.join(BASE_DIR, "ml_models", "saved_models", "scaler.pkl")

    print("=" * 65)
    print("  Energy Forecasting LSTM — Synthetic Training Pipeline")
    print("=" * 65)

    # ── Step 1: Generate data ──
    print("\n── Generating Synthetic Data ─────────────────────────────────────")
    df = generate_synthetic_data(num_months=12)

    # Optionally persist it for inspection
    csv_out = os.path.join(BASE_DIR, "demo_energy_data.csv")
    df.to_csv(csv_out, index=False)
    print(f"  CSV saved → {csv_out}")

    # ── Step 2: Train ──
    metrics = train(
        df=df,
        model_save_path=MODEL_PATH,
        scaler_save_path=SCALER_PATH,
        epochs=30,
        batch_size=64,
    )

    print("\n" + "=" * 65)
    print("  Training complete!")
    print(f"  RMSE={metrics['rmse']:.4f} | MAE={metrics['mae']:.4f} | MAPE={metrics['mape']:.2f}%")
    print(f"  Epochs run: {metrics['epochs_run']}")
    print("=" * 65)
