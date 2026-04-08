import os
import numpy as np
import tensorflow as tf
from .preprocessing import load_scaler

class PredictionService:
    def __init__(self, model_path, scaler_path, seq_length=24):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.seq_length = seq_length
        self.model = None
        self.scaler = None

    def load_artifacts(self):
        if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path):
            raise FileNotFoundError("Model or scaler not found. Train the model first.")
        if self.model is None:
            self.model = tf.keras.models.load_model(self.model_path)
        if self.scaler is None:
            self.scaler = load_scaler(self.scaler_path)

    def predict_next(self, recent_data):
        """
        recent_data: numpy array of shape (seq_length, num_features)
        Returns the predicted consumption_kwh
        """
        self.load_artifacts()
        
        # Scale input
        scaled_input = self.scaler.transform(recent_data)
        
        # Reshape for LSTM: (samples, time_steps, features)
        input_seq = np.array([scaled_input])
        
        # Predict
        pred_scaled = self.model.predict(input_seq)
        
        # Inverse transform
        num_features = recent_data.shape[1]
        pred_full = np.zeros((1, num_features))
        pred_full[0, 0] = pred_scaled[0, 0]
        
        inv_pred = self.scaler.inverse_transform(pred_full)
        return float(inv_pred[0, 0])
