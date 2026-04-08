import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout


def build_lstm_model(input_shape):
    """Build and compile the Keras LSTM model for energy forecasting."""
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)  # Output layer for single step prediction (consumption_kwh)
    ])

    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    return model
