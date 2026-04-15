import api from './api';

class OptimizationService {
  /**
   * Fetch data-driven optimization recommendations.
   * Returns: { recommendations, data_driven, context, summary }
   */
  async getRecommendations() {
    const response = await api.get('/optimization/recommendations');
    return response.data;
  }

  /**
   * Fetch peak shaving before/after analysis.
   * Returns: { threshold_kw, hourly, cost_before, cost_after, cost_savings, savings_percent }
   */
  async getPeakShaving() {
    const response = await api.get('/optimization/peak-shaving');
    return response.data;
  }
}

export default new OptimizationService();
