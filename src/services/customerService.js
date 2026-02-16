/**
 * Customer Service
 * API calls for customer management
 */

import api from './api';

const customerService = {
  /**
   * Get all customers
   * GET /api/v1/customers
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/api/v1/customers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch customers';
    }
  },

  /**
   * Get single customer
   * GET /api/v1/customers/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/v1/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch customer';
    }
  },

  /**
   * Get customer orders
   * GET /api/v1/customers/:id/orders
   */
  async getOrders(id) {
    try {
      const response = await api.get(`/api/v1/customers/${id}/orders`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch customer orders';
    }
  },

  /**
   * Search customers
   * GET /api/v1/customers/search
   */
  async search(query) {
    try {
      const response = await api.get('/api/v1/customers/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to search customers';
    }
  }
};

export default customerService;