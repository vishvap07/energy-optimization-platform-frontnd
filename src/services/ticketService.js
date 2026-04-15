import api from './api';

class TicketService {
  async getTickets(status = null, priority = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    const response = await api.get(`/tickets/list?${params.toString()}`);
    return response.data;
  }

  async getTicket(id) {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  }

  async createTicket(ticketData) {
    const response = await api.post('/tickets/create', ticketData);
    return response.data;
  }

  async updateStatus(id, status, resolutionNotes = '') {
    const response = await api.put(`/tickets/${id}/update-status`, {
      status,
      resolution_notes: resolutionNotes
    });
    return response.data;
  }

  async addResponse(id, message, isInternal = false) {
    const response = await api.post(`/tickets/${id}/respond`, {
      message,
      is_internal: isInternal
    });
    return response.data;
  }
}

export default new TicketService();
