/**
 * API Service
 * Axios instance with interceptors for authentication
 * WITH SESSION SUPPORT
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
  withCredentials: true, // IMPORTANT: Send cookies with requests for session auth
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Session is handled by cookies, but we can still add token if needed
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          console.log('Unauthorized - redirecting to login');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      if (status === 403) {
        console.error('Access forbidden');
      }

      if (status >= 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      console.error('Network error - no response from server');
    }

    return Promise.reject(error);
  }
);

export default api;