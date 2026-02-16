/**
 * Product Service
 * API calls for product management
 */

import api from './api';

const productService = {
  /**
   * Get all products
   * GET /api/v1/products
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/api/v1/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch products';
    }
  },

  /**
   * Get single product
   * GET /api/v1/products/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/v1/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch product';
    }
  },

  /**
   * Create product
   * POST /api/v1/products
   */
  async create(productData) {
    try {
      const response = await api.post('/api/v1/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create product';
    }
  },

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  async update(id, productData) {
    try {
      const response = await api.put(`/api/v1/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update product';
    }
  },

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/api/v1/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete product';
    }
  },

  /**
   * Search products
   * GET /api/v1/products/search
   */
  async search(query) {
    try {
      const response = await api.get('/api/v1/products/search', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to search products';
    }
  },

  /**
   * Get low stock products
   * GET /api/v1/products/low-stock
   */
  async getLowStock() {
    try {
      const response = await api.get('/api/v1/products/low-stock');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch low stock products';
    }
  },

  /**
   * Get product stats
   * GET /api/v1/products/stats
   */
  async getStats() {
    try {
      const response = await api.get('/api/v1/products/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch product stats';
    }
  },

  /**
   * Get categories
   * GET /api/v1/products/categories
   */
  async getCategories() {
    try {
      const response = await api.get('/api/v1/products/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch categories';
    }
  }
};

export default productService;