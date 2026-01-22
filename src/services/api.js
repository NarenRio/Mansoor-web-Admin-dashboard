import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth and redirect to login
      authService.clearAuth();
      // Only redirect if we're not already on login/signup page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

  // Court Master API endpoints
  // Get all courts
  getAllCourts: async (search = null) => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/admin/courts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching courts:', error);
      throw error;
    }
  },

  // Get court by ID
  getCourtById: async (courtId) => {
    try {
      const response = await api.get(`/admin/courts/${courtId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching court:', error);
      throw error;
    }
  },

  // Create new court
  createCourt: async (courtData) => {
    try {
      const response = await api.post('/admin/courts', courtData);
      return response.data;
    } catch (error) {
      console.error('Error creating court:', error);
      throw error;
    }
  },

  // Update court
  updateCourt: async (courtId, courtData) => {
    try {
      const response = await api.put(`/admin/courts/${courtId}`, courtData);
      return response.data;
    } catch (error) {
      console.error('Error updating court:', error);
      throw error;
    }
  },

  // Delete court
  deleteCourt: async (courtId) => {
    try {
      const response = await api.delete(`/admin/courts/${courtId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting court:', error);
      throw error;
    }
  },

  // Court Type Master API endpoints
  // Get all court types
  getAllCourtTypes: async (search = null) => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/admin/court-types', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching court types:', error);
      throw error;
    }
  },

  // Get court type by ID
  getCourtTypeById: async (courtTypeId) => {
    try {
      const response = await api.get(`/admin/court-types/${courtTypeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching court type:', error);
      throw error;
    }
  },

  // Create new court type
  createCourtType: async (courtTypeData) => {
    try {
      const response = await api.post('/admin/court-types', courtTypeData);
      return response.data;
    } catch (error) {
      console.error('Error creating court type:', error);
      throw error;
    }
  },

  // Update court type
  updateCourtType: async (courtTypeId, courtTypeData) => {
    try {
      const response = await api.put(`/admin/court-types/${courtTypeId}`, courtTypeData);
      return response.data;
    } catch (error) {
      console.error('Error updating court type:', error);
      throw error;
    }
  },

  // Delete court type
  deleteCourtType: async (courtTypeId) => {
    try {
      const response = await api.delete(`/admin/court-types/${courtTypeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting court type:', error);
      throw error;
    }
  },
};

export default api;
