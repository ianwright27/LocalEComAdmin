/**
 * API Service
 * Axios instance with interceptors for authentication
 */

import axios from 'axios';

// Base URL should NOT include /api/v1 - router handles that
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/wrightcommerce/public';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status } = error.response;

      if (status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (status === 403) {
        // Forbidden
        console.error('Access forbidden');
      }

      if (status >= 500) {
        // Server error
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response from server');
    }

    return Promise.reject(error);
  }
);

export default api;