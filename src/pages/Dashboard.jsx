/**
 * Dashboard Page
 * Admin overview with stats
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/orders?limit=5'),
        api.get('/customers?limit=1'),
      ]); 

      // Calculate stats
      const totalProducts = productsRes.data.data.total || 0;
      const orders = ordersRes.data.data.data || [];
      const totalOrders = ordersRes.data.data.total || 0;
      const totalCustomers = customersRes.data.data.total || 0;

      // Calculate revenue from recent orders
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        lowStockProducts: 0, // Will implement later
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Orders */}
        {stats.pendingOrders > 0 && (
          <Link
            to="/orders?status=pending"
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center">
              <FiAlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <p className="font-semibold text-yellow-800">{stats.pendingOrders} Pending Orders</p>
                <p className="text-sm text-yellow-700">Need your attention</p>
              </div>
            </div>
          </Link>
        )}

        {/* Low Stock */}
        {stats.lowStockProducts > 0 && (
          <Link
            to="/products?stock=low"
            className="bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center">
              <FiAlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <p className="font-semibold text-red-800">{stats.lowStockProducts} Low Stock Items</p>
                <p className="text-sm text-red-700">Restock needed</p>
              </div>
            </div>
          </Link>
        )}

        {/* Growth */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <FiTrendingUp className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="font-semibold text-green-800">Growing Strong</p>
              <p className="text-sm text-green-700">Keep up the good work!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-brand-accent hover:underline text-sm font-medium">
              View All →
            </Link>
          </div>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/orders/${order.id}`} className="text-brand-accent hover:underline font-medium">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">
                        KES {parseFloat(order.total).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
