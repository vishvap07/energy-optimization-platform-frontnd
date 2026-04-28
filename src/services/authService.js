import api from './api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  }

  async updateProfile(data) {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  }

  async changePassword(oldPassword, newPassword) {
    const response = await api.put('/auth/profile/', {
      old_password: oldPassword,
      new_password: newPassword
    });
    return response.data;
  }

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
}

export default new AuthService();
