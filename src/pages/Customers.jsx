/**
 * Customers List Page - FIXED
 * total_spent computed correctly from customer orders
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiEye,
  FiShoppingCart,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import customerService from '../services/customerService';

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 15,
    total: 0,
  });

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your customer base ({pagination.total} total)
          </p>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-4">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {(searchQuery || dateFrom || dateTo) && (
          <div className="mt-2">
            <button onClick={clearFilters} className="text-xs text-brand-accent hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No customers found</p>
            <p className="text-sm mt-2">
              {searchQuery || dateFrom || dateTo
                ? 'Try adjusting your filters'
                : 'Customers will appear here once orders are placed'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                          title="View Customer"
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
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
