/**
 * Customer Details Page
 * Full customer profile with order history and spending intelligence
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiTrendingUp,
  FiLock,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import customerService from '../services/customerService';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const [customerRes, ordersRes] = await Promise.all([
        customerService.getById(id),
        customerService.getOrders(id),
      ]);

      console.log('Customer:', customerRes);
      console.log('Customer orders:', ordersRes);

      setCustomer(customerRes.data);
      setOrders(ordersRes.data?.items || ordersRes.data || []);
    } catch (error) {
      console.error('Fetch customer error:', error);
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  // Compute stats from orders
  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

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

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Customer not found</p>
        <Link to="/customers" className="text-brand-accent hover:underline mt-4 inline-block">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/customers" className="mr-4 text-gray-600 hover:text-gray-900">
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex items-center">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">
                {customer.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
              <p className="text-sm text-gray-500">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <FiUser className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={15} />
                <span className="text-sm text-gray-800">{customer.name}</span>
              </div>
              <div className="flex items-start">
                <FiMail className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={15} />
                <span className="text-sm text-gray-800">{customer.email}</span>
              </div>
              <div className="flex items-start">
                <FiPhone className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={15} />
                <span className="text-sm text-gray-800">{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <FiMapPin className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={15} />
                <span className="text-sm text-gray-800">{customer.address || 'No address on file'}</span>
              </div>
              <div className="flex items-start">
                <FiCalendar className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={15} />
                <span className="text-sm text-gray-800">
                  Joined {new Date(customer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Customer Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <FiShoppingCart className="mr-2 text-gray-400" size={14} />
                  Total Orders
                </div>
                <span className="text-sm font-bold text-gray-900">{totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <FiDollarSign className="mr-2 text-gray-400" size={14} />
                  Total Spent
                </div>
                <span className="text-sm font-bold text-green-700">
                  KES {totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <FiTrendingUp className="mr-2 text-gray-400" size={14} />
                  Avg. Order Value
                </div>
                <span className="text-sm font-bold text-gray-900">
                  KES {avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Completed</span>
                <span className="text-xs font-semibold text-green-700">{completedOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Pending</span>
                <span className="text-xs font-semibold text-yellow-700">{pendingOrders}</span>
              </div>
            </div>
          </div>

          {/* WrightAnalytics Teaser */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <FiTrendingUp className="text-orange-400 mr-2" size={16} />
              <span className="text-white text-sm font-semibold">Business Intelligence</span>
            </div>
            <div className="space-y-2 mb-4">
              {[
                'Purchase behaviour trends',
                'Customer lifetime value',
                'Product affinity analysis',
                'Churn risk prediction',
                'Export customer data (CSV/PDF)',
                'Segment customers by spend',
              ].map((feature, i) => (
                <div key={i} className="flex items-center">
                  <FiLock className="text-gray-500 mr-2 flex-shrink-0" size={11} />
                  <span className="text-gray-400 text-xs">{feature}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-3">
              {/* <p className="text-orange-400 text-xs font-semibold">WrightAnalytics</p> */}
              <p className="text-gray-500 text-xs mt-0.5">
                For advanced business intelligence, upgrade to{' '}
                <span className="text-orange-400 font-medium">WrightAnalytics</span> — coming soon.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Order History
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {totalOrders}
                </span>
              </h2>
              {totalOrders > 0 && (
                <Link
                  to={`/orders?search=${customer.name.replace(/\s/g, "+")}`}
                  className="text-xs text-brand-accent hover:underline"
                >
                  View in Orders →
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs mt-1 text-gray-400">
                  This customer hasn't placed any orders yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-sm font-semibold text-brand-accent hover:underline"
                        >
                          {order.order_number}
                        </Link>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          order.payment_status === 'paid'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {order.payment_status || 'unpaid'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        KES {parseFloat(order.total || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1.5 ml-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FiPackage className="text-gray-300 mr-2" size={12} />
                              <span className="text-xs text-gray-600">
                                {item.product_name}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                × {item.quantity}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              KES {parseFloat(item.total || item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 ml-1">No item details available</p>
                    )}

                    {/* Order Date */}
                    <div className="mt-2 flex items-center">
                      <FiCalendar className="text-gray-300 mr-1.5" size={11} />
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDetails;
