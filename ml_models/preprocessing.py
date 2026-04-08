import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import os


def load_and_preprocess_data(csv_path, seq_length=24):
    """Load energy dataset, normalize, and create sequences for LSTM."""
    df = pd.read_csv(csv_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)

    # We predict consumption_kwh based on past values and other features
    features = ['consumption_kwh', 'demand_kw', 'temperature']
    data = df[features].values

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)

    X, y = [], []
    for i in range(len(scaled_data) - seq_length):
        X.append(scaled_data[i:(i + seq_length)])
        y.append(scaled_data[i + seq_length, 0])  # Predicting consumption_kwh

    X = np.array(X)
    y = np.array(y)

    return X, y, scaler, df

def save_scaler(scaler, path):
    """Save the fitted scaler for inference."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(scaler, path)

def load_scaler(path):
    """Load a previously saved scaler."""
    return joblib.load(path)
