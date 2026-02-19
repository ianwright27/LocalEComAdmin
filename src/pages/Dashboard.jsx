/**
 * Dashboard - POLISHED VERSION
 * Smart greeting for first-time vs returning users
 * Hides motivational messages when no data
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Check if first time (no previous login timestamp)
    const lastLogin = localStorage.getItem('lastLoginTime');
    const currentTime = Date.now();
    
    if (!lastLogin) {
      setIsFirstTime(true);
    }
    
    // Update login timestamp
    localStorage.setItem('lastLoginTime', currentTime.toString());
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        api.get('/api/v1/products?per_page=1'),
        api.get('/api/v1/orders?per_page=5'),
        api.get('/api/v1/customers?per_page=1'),
      ]);

      const totalProducts = productsRes.data?.data?.pagination?.total || 0;
      const orders = ordersRes.data?.data?.items || [];
      const totalOrders = ordersRes.data?.data?.pagination?.total || 0;
      const totalCustomers = customersRes.data?.data?.pagination?.total || 0;

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        lowStockProducts: 0,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const hasAnyData = stats.totalOrders > 0 || stats.totalRevenue > 0;

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'bg-blue-500',
      link: '/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'bg-green-500',
      link: '/orders',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: FiUsers,
      color: 'bg-purple-500',
      link: '/customers',
    },
    {
      title: 'Revenue',
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-orange-500',
      link: '/payments',
    },
  ];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Smart Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {isFirstTime ? 'Hello there' : 'Welcome back'}, {user?.name || 'Admin'}!
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isFirstTime 
            ? "Let's get your business set up and running" 
            : "Here's what's happening with your business today"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Conditional Motivational Message - Only if data exists */}
      {hasAnyData && (
        <div className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <FiTrendingUp size={32} className="mr-4" />
            <div>
              <h3 className="text-lg font-semibold">Growing Strong!</h3>
              <p className="text-sm opacity-90">
                {stats.totalOrders} orders and KES {stats.totalRevenue.toLocaleString()} in revenue. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {stats.pendingOrders > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="text-yellow-600 mr-3" size={20} />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''}
              </p>
              <Link to="/orders?status=pending" className="text-sm text-yellow-700 hover:underline">
                View pending orders →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          {/* Only show View All if orders exist */}
          {stats.totalOrders > 0 && (
            <Link to="/orders" className="text-sm text-brand-accent hover:underline">
              View All
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/orders/${order.id}`} className="text-sm font-medium text-brand-accent hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      KES {parseFloat(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FiShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Orders will appear here once customers start purchasing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
