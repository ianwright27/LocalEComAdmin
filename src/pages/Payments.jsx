/**
 * Payments Page - MOBILE OPTIMIZED WITH VIEW TOGGLE
 * List/Thumbnails views, collapsible filters, localStorage persistence
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiDollarSign,
  FiSearch,
  FiEye,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiList,
  FiGrid,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_paid: 0,
    total_unpaid: 0,
    total_revenue: 0,
    paid_count: 0,
    unpaid_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Get view mode from localStorage or default to 'list'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('paymentsViewMode') || 'list';
  });
  
  const [showFilters, setShowFilters] = useState(false); // Mobile filters toggle

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [methodFilter, setMethodFilter] = useState(searchParams.get('method') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 15,
    total: 0,
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('paymentsViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, statusFilter, methodFilter, dateFrom, dateTo]);

  // Sync to URL
  useEffect(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (methodFilter) params.method = methodFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (pagination.page > 1) params.page = pagination.page;
    setSearchParams(params);
  }, [statusFilter, methodFilter, dateFrom, dateTo, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, per_page: pagination.limit };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.payment_method = methodFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const [paymentsRes, statsRes] = await Promise.all([
        api.get('/api/v1/payments', { params }),
        api.get('/api/v1/payments/stats'),
      ]);

      setPayments(paymentsRes.data?.data?.items || []);
      setPagination((prev) => ({
        ...prev,
        total: paymentsRes.data?.data?.pagination?.total || 0,
      }));

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Fetch payments error:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setMethodFilter('');
    setDateFrom('');
    setDateTo('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all transactions ({pagination.total} total)
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
        </div>
      </div>

      {/* Stats Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                KES {parseFloat(stats.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-green-600" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Paid</p>
              <p className="text-xl font-bold text-green-700 mt-1">
                KES {parseFloat(stats.paid_revenue || stats.total_paid || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{stats.paid_count || 0} transactions</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-500" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Unpaid</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                KES {parseFloat(stats.unpaid_revenue || stats.total_unpaid || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{stats.unpaid_count || 0} transactions</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <FiClock className="text-red-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filters - Responsive with Mobile Toggle */}
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-4 ${
        showFilters ? 'block' : 'hidden lg:block'
      }`}>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Payment Status */}
            <div className="sm:col-span-2 lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="">All Payment Status</option>
                <option value="completed">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Method */}
            <div className="sm:col-span-2 lg:col-span-2">
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="">All Methods</option>
                <option value="mpesa">M-PESA</option>
                <option value="paystack">Paystack</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
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
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(statusFilter || methodFilter || dateFrom || dateTo) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button onClick={clearFilters} className="text-sm text-brand-accent hover:underline">
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
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <FiDollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No payments found</p>
          <p className="text-sm mt-2">
            {statusFilter || methodFilter || dateFrom || dateTo
              ? 'Try adjusting your filters'
              : 'Payments will appear here once orders are paid'}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${payment.order_id}`}
                        className="text-sm font-medium text-brand-accent hover:underline"
                      >
                        {payment.order_number || `#${payment.order_id}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{payment.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{payment.customer_phone || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        KES {parseFloat(payment.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">
                        {payment.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-gray-500 font-mono">
                        {payment.reference || payment.transaction_id || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/orders/${payment.order_id}`}
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
                {pagination.total} payments
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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
            {payments.map((payment) => (
              <Link
                key={payment.id}
                to={`/orders/${payment.order_id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                {/* Order Number & Status */}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm text-brand-accent truncate">
                    {payment.order_number || `#${payment.order_id}`}
                  </p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {payment.customer_name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {payment.customer_phone || 'No phone'}
                  </p>
                </div>

                {/* Payment Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Method</span>
                    <span className="text-xs text-gray-900 capitalize font-medium">
                      {payment.payment_method || 'N/A'}
                    </span>
                  </div>
                  {payment.reference && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Reference</span>
                      <span className="text-xs text-gray-500 font-mono truncate ml-2">
                        {payment.reference}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount & Date */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">
                    KES {parseFloat(payment.amount || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
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
                {pagination.total} payments
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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

export default Payments;
