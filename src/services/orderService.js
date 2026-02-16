/**
 * Order Service
 * API calls for order management
 */

import api from './api';

const orderService = {
  /**
   * Get all orders
   * GET /api/v1/orders
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/api/v1/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch orders';
    }
  },

  /**
   * Get single order
   * GET /api/v1/orders/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/v1/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch order';
    }
  },

  /**
   * Create order
   * POST /api/v1/orders
   */
  async create(orderData) {
    try {
      const response = await api.post('/api/v1/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create order';
    }
  },

  /**
   * Update order status
   * PUT /api/v1/orders/:id/status
   */
  async updateStatus(id, status) {
    try {
      const response = await api.put(`/api/v1/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update order status';
    }
  },

  /**
   * Cancel order
   * DELETE /api/v1/orders/:id
   */
  async cancel(id) {
    try {
      const response = await api.delete(`/api/v1/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to cancel order';
    }
  },

  /**
   * Get order stats
   * GET /api/v1/orders/stats
   */
  async getStats() {
    try {
      const response = await api.get('/api/v1/orders/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch order stats';
    }
  }
};

export default orderService;