/**
 * Products List Page - WITH VIEW TOGGLE
 * List view (table) or Thumbnails view (cards)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2,
  FiPackage,
  FiAlertCircle,
  FiList,
  FiGrid,
  FiFilter,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import productService from '../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get view mode from localStorage or default to 'list'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('productsViewMode') || 'list';
  });
  
  const [showFilters, setShowFilters] = useState(false); // Mobile filters toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('productsViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, statusFilter, categoryFilter, minPrice, maxPrice]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const response = await productService.getAll(params);
      
      setProducts(response.data?.items || []);
      setPagination({
        ...pagination,
        total: response.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await productService.search(searchQuery);
      setProducts(response.data?.items || response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await productService.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
    setPagination({ ...pagination, page: 1 });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your inventory ({pagination.total} total)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Filters Toggle (Mobile Only) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiFilter size={16} className={showFilters ? 'text-brand-accent' : ''} />
            <span className="ml-1.5">Filters</span>
          </button>

          {/* View Toggle - Icon only on mobile */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-2 lg:px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-brand-accent shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <FiList size={16} />
              <span className="ml-1.5 hidden lg:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('thumbnails')}
              className={`flex items-center px-2 lg:px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'thumbnails'
                  ? 'bg-white text-brand-accent shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Thumbnails View"
            >
              <FiGrid size={16} />
              <span className="ml-1.5 hidden lg:inline">Thumbnails</span>
            </button>
          </div>

          {/* Add Product Button - "Add" on mobile, "Add Product" on desktop */}
          <Link
            to="/products/add"
            className="flex items-center px-3 py-2 bg-brand-accent hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
          >
            <FiPlus size={16} />
            <span className="ml-1.5 hidden sm:inline">Add</span>
            <span className="ml-1.5 hidden lg:inline">Product</span>
          </Link>
        </div>
      </div>

      {/* Compact Filters - Responsive with Mobile Toggle */}
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-4 ${
        showFilters ? 'block' : 'hidden lg:block'
      }`}>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              placeholder="Min Price"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          {/* Max Price */}
          <div>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              placeholder="Max Price"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || statusFilter || categoryFilter || minPrice || maxPrice) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="text-sm text-brand-accent hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No products found</p>
          <p className="text-sm mt-2">
            {searchQuery || statusFilter || categoryFilter || minPrice || maxPrice
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </p>
          {!searchQuery && !statusFilter && !categoryFilter && (
            <Link
              to="/products/add"
              className="inline-flex items-center mt-4 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-orange-600"
            >
              <FiPlus className="mr-2" />
              Add Product
            </Link>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW (Table) */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.image ? (
                            <img
                              src={`http://localhost/wrightcommerce/public/uploads/${product.image}`}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                              <FiPackage className="text-gray-400" size={16} />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {product.category || 'Uncategorized'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {parseFloat(product.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center text-sm ${
                        product.stock <= 0 ? 'text-red-600' :
                        product.stock < 10 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock <= 0 && <FiAlertCircle className="mr-1" size={14} />}
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/products/edit/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit className="inline" size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* THUMBNAILS VIEW (Cards) */
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100">
                  {product.image ? (
                    <img
                      src={`http://localhost/wrightcommerce/public/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="text-gray-300" size={48} />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{product.category || 'Uncategorized'}</p>
                  <p className="text-sm font-bold text-gray-900 mt-2">
                    KES {parseFloat(product.price).toLocaleString()}
                  </p>
                  
                  {/* Stock & Status */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      product.stock <= 0 ? 'text-red-600' :
                      product.stock < 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      Stock: {product.stock}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/products/edit/${product.id}`}
                      className="flex-1 flex items-center justify-center px-2 py-1.5 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 transition-colors"
                    >
                      <FiEdit className="mr-1" size={12} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="flex-1 flex items-center justify-center px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="mr-1" size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Thumbnails */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md px-4 py-3">
              <div className="text-xs text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
