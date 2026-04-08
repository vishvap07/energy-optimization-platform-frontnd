import os
import sys

# Add project root to path so we can import ml_models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.training_pipeline import train_and_evaluate


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'data', 'energy_dataset.csv')
    model_path = os.path.join(base_dir, 'ml_models', 'saved_models', 'lstm_model.h5')
    scaler_path = os.path.join(base_dir, 'ml_models', 'saved_models', 'scaler.pkl')

    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    print("=== Starting Model Training ===")
    train_and_evaluate(
        csv_path=csv_path,
        model_path=model_path,
        scaler_path=scaler_path,
        epochs=50,
        batch_size=16,
        seq_length=24
    )
    print("=== Training Complete ===")
