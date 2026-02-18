/**
 * API Configuration
 * CORS FIX: Uses POST with _method for PUT/PATCH/DELETE
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost/wrightcommerce/public',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ CORS FIX: Intercept PUT/PATCH/DELETE and convert to POST
api.interceptors.request.use((config) => {
  // If method is PUT, PATCH, or DELETE, convert to POST with _method
  if (['put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    const originalMethod = config.method.toUpperCase();
    
    // Convert to POST
    config.method = 'post';
    
    // Add _method to data
    if (config.data instanceof FormData) {
      // For FormData (like file uploads)
      config.data.append('_method', originalMethod);
    } else {
      // For JSON data
      config.data = {
        ...config.data,
        _method: originalMethod,
      };
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;