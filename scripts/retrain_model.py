import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.training_pipeline import train_and_evaluate


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # For retraining, we might use a larger or newer dataset
    csv_path = os.path.join(base_dir, 'data', 'energy_dataset.csv')
    model_path = os.path.join(base_dir, 'ml_models', 'saved_models', 'lstm_model_v2.h5')
    scaler_path = os.path.join(base_dir, 'ml_models', 'saved_models', 'scaler_v2.pkl')

    print("=== Starting Incremental Model Retraining ===")
    train_and_evaluate(
        csv_path=csv_path,
        model_path=model_path,
        scaler_path=scaler_path,
        epochs=30,  # Fewer epochs for retraining
        batch_size=16,
        seq_length=24
    )
    print("=== Retraining Complete ===")
