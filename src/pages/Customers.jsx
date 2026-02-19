/**
 * Customers List Page - MOBILE OPTIMIZED WITH VIEW TOGGLE
 * List/Thumbnails views, collapsible filters, localStorage persistence
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiEye,
  FiShoppingCart,
  FiFilter,
  FiList,
  FiGrid,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import customerService from '../services/customerService';

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get view mode from localStorage or default to 'list'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('customersViewMode') || 'list';
  });
  
  const [showFilters, setShowFilters] = useState(false); // Mobile filters toggle

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 15,
    total: 0,
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('customersViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, dateFrom, dateTo]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        fetchCustomers();
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Sync filters to URL
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (pagination.page > 1) params.page = pagination.page;
    setSearchParams(params);
  }, [searchQuery, dateFrom, dateTo, pagination.page]);

  /**
   * Enriches a list of customers with computed total_spent and order_count
   * by fetching each customer's orders in parallel
   */
  const enrichCustomers = async (rawCustomers) => {
    const enriched = await Promise.all(
      rawCustomers.map(async (customer) => {
        // Skip fetching if backend already provides these fields
        if (customer.total_spent !== undefined && customer.order_count !== undefined) {
          return customer;
        }
        try {
          const ordersRes = await customerService.getOrders(customer.id);
          const orders = ordersRes.data?.items || ordersRes.data || [];
          const total_spent = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
          const order_count = orders.length;
          return { ...customer, total_spent, order_count };
        } catch {
          return { ...customer, total_spent: 0, order_count: 0 };
        }
      })
    );
    return enriched;
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.limit,
      };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await customerService.getAll(params);
      const raw = response.data?.items || [];

      // Enrich with computed totals then set state once
      const enriched = await enrichCustomers(raw);
      setCustomers(enriched);

      setPagination((prev) => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('Fetch customers error:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await customerService.search(searchQuery);
      const raw = response.data?.items || response.data || [];

      // Enrich search results too
      const enriched = await enrichCustomers(raw);
      setCustomers(enriched);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your customer base ({pagination.total} total)
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

      {/* Compact Filters - Responsive with Mobile Toggle */}
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-4 ${
        showFilters ? 'block' : 'hidden lg:block'
      }`}>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
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
                placeholder="From"
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
                placeholder="To"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || dateFrom || dateTo) && (
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
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No customers found</p>
          <p className="text-sm mt-2">
            {searchQuery || dateFrom || dateTo
              ? 'Try adjusting your filters'
              : 'Customers will appear here once orders are placed'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW (Table) */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {customer.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <FiShoppingCart size={14} className="mr-1 text-gray-400" />
                        {customer.order_count ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {(customer.total_spent ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/customers/${customer.id}`}
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
                {pagination.total} customers
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                to={`/customers/${customer.id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-brand-primary mx-auto flex items-center justify-center mb-3">
                  <span className="text-white text-xl font-bold">
                    {customer.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>

                {/* Customer Info */}
                <h3 className="font-medium text-sm text-gray-900 truncate" title={customer.name}>
                  {customer.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate" title={customer.email}>
                  {customer.email}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {customer.phone || 'No phone'}
                </p>

                {/* Stats */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-center text-xs text-gray-600 mb-1">
                    <FiShoppingCart size={12} className="mr-1" />
                    {customer.order_count ?? 0} orders
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    KES {(customer.total_spent ?? 0).toLocaleString()}
                  </p>
                </div>

                {/* Joined Date */}
                <p className="text-xs text-gray-400 mt-2">
                  Joined {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>

          {/* Pagination for Thumbnails */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md px-4 py-3">
              <div className="text-xs text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} customers
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

export default Customers;
