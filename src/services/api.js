import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API endpoints
export const adminAPI = {
  // Get all firms with their advocates
  getAllFirmsWithAdvocates: async (firmName = null) => {
    try {
      const params = firmName ? { firmName } : {};
      const response = await api.get('/admin/firms', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching firms:', error);
      throw error;
    }
  },

  // Get all advocates
  getAllAdvocates: async (search = null) => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/admin/advocates', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching advocates:', error);
      throw error;
    }
  },

  // Activate a user
  activateUser: async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  // Deactivate a user
  deactivateUser: async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Get user with firm details
  getUserWithFirm: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
};

export default api;
