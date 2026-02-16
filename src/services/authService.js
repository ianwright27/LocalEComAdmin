/**
 * Authentication Service
 * Handles login, register, logout, and session management
 */

import api from './api';

const authService = {
  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} User data
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user } = response.data.data;
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  },

  /**
   * Register new user
   * @param {Object} userData 
   * @returns {Promise<Object>} User data
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user } = response.data.data;
        
        // Auto-login after registration
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User data
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      
      throw new Error('Failed to fetch profile');
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  /**
   * Update user profile
   * @param {Object} data 
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(data) {
    try {
      const response = await api.put('/auth/profile', data);
      
      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      
      throw new Error('Failed to update profile');
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  /**
   * Change password
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<void>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      if (!response.data.success) {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      throw error.response?.data?.message || 'Failed to change password';
    }
  }
};

export default authService;