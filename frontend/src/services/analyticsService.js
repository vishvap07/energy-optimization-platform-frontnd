import api from './api';

class AnalyticsService {
  // Energy Analytics
  async getEnergyData(days = 30) {
    const response = await api.get(`/energy/data?days=${days}`);
    return response.data;
  }

  async getAnalyticsSummary() {
    const response = await api.get('/energy/analytics');
    return response.data;
  }

  async getPeakDemand() {
    const response = await api.get('/energy/peak-demand');
    return response.data;
  }

  // Forecasting
  async getForecast(days = 14) {
    const response = await api.get(`/forecast/predict?days=${days}`);
    return response.data;
  }

  async triggerModelTraining() {
    const response = await api.post('/forecast/train-model');
    return response.data;
  }

  // Optimization
  async getOptimizationRecommendations() {
    const response = await api.get('/optimization/recommendations');
    return response.data;
  }

  async getPeakShavingAnalysis() {
    const response = await api.get('/optimization/peak-shaving');
    return response.data;
  }

  // Monitoring
  async getSystemHealth() {
    const response = await api.get('/monitoring/system-health/');
    return response.data;
  }

  async getLogs(limit = 100) {
    const response = await api.get(`/monitoring/logs/?limit=${limit}`);
    return response.data;
  }
}

export default new AnalyticsService();
