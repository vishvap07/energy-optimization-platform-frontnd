import api from './api';

class AlertsService {
  /**
   * Fetch dynamic alerts based on real consumption vs. thresholds.
   * Returns: { alerts: [{ type, title, message }], generated_at }
   */
  async getAlerts() {
    const response = await api.get('/energy/alerts/');
    return response.data;
  }
}

export default new AlertsService();
