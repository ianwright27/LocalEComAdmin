/**
 * Orders List Page - MOBILE OPTIMIZED WITH VIEW TOGGLE
 * List/Thumbnails views, collapsible filters, icon-only buttons on mobile
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FiShoppingCart,
  FiSearch,
  FiEye,
  FiFilter,
  FiDownload,
  FiList,
  FiGrid,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get view mode from localStorage or default to 'list'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('ordersViewMode') || 'list';
  });
  
  const [showFilters, setShowFilters] = useState(false); // Mobile filters toggle
  
  // Initialize filters from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(searchParams.get('payment_status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
    total: 0,
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ordersViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, paymentStatusFilter, dateFrom, dateTo]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (statusFilter) params.status = statusFilter;
    if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (pagination.page > 1) params.page = pagination.page;
    
    setSearchParams(params);
  }, [searchQuery, statusFilter, paymentStatusFilter, dateFrom, dateTo, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await orderService.getAll(params);
      // console.log('Fetch orders response:', response);
      
      setOrders(response.data?.items || []);
      setPagination({
        ...pagination,
        total: response.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await orderService.search(searchQuery);
      setOrders(response.data?.items || response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPagination({ ...pagination, page: 1 });
    setSearchParams({});
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer orders ({pagination.total} total)
            {statusFilter && ` - ${statusFilter}`}
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

          {/* Export Button - Icon only on mobile */}
          <button
            onClick={() => toast.info('Export feature coming soon!')}
            className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            <FiDownload size={16} />
            <span className="ml-1.5 hidden sm:inline">Export</span>
          </button>
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
                  placeholder="Search order number, customer..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            </div>

            {/* Order Status */}
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
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="">Payment Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            {/* Date To */}
            <div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter || paymentStatusFilter || dateFrom || dateTo) && (
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
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <FiShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No orders found</p>
          <p className="text-sm mt-2">
            {searchQuery || statusFilter || paymentStatusFilter || dateFrom || dateTo
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers start purchasing'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW (Table) */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-sm font-medium text-brand-accent hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {order.items?.length || 0} {order.items.length == 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{order.customer?.name || order?.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customer?.email || order?.customer_email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {parseFloat(order.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="inline" size={16} />
                      </Link>
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
                {pagination.total} orders
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                {/* Order Icon & Number */}
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShoppingCart className="text-gray-500" size={24} />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-sm text-brand-accent truncate">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.length || 0} {order.items.length == 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.customer?.name || order?.customer_name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {order.customer?.email || order?.customer_email || 'N/A'}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status || 'unpaid'}
                  </span>
                </div>

                {/* Total & Date */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">
                    KES {parseFloat(order.total || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination for Thumbnails */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md px-4 py-3">
              <div className="text-xs text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
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

export default Orders;
