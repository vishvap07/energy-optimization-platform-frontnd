import api from './api';

class ForecastService {
  /**
   * Fetch N-day demand forecast.
   * Returns: { forecast, hourly_forecast, model_version, used_lstm, mape, generated_at }
   */
  async getForecast(days = 14) {
    const response = await api.get(`/forecast/predict?days=${days}`);
    return response.data;
  }

  /**
   * Fetch stored forecast results (last 30).
   */
  async getForecastResults() {
    const response = await api.get('/forecast/results/');
    return response.data;
  }

  /**
   * Trigger LSTM model training (admin only).
   * Returns: { job_id, status, metrics, message }
   */
  async triggerTraining() {
    const response = await api.post('/forecast/train-model');
    return response.data;
  }
}

export default new ForecastService();
