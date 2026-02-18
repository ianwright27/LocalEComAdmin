/**
 * Order Details Page
 * View and update order information
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiPackage,
  FiCreditCard,
  FiCalendar,
  FiTruck,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      console.log('Order details:', response);
      setOrder(response.data);
      setNewStatus(response.data.status);
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast.info('Status unchanged');
      return;
    }

    try {
      setUpdating(true);
      await orderService.updateStatus(id, newStatus);
      toast.success('Order status updated!');
      fetchOrder();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Order not found</p>
        <Link to="/orders" className="text-brand-accent hover:underline mt-4 inline-block">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/orders"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order {order.order_number}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h2>
            <div className="flex items-center space-x-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className="px-6 py-2 bg-brand-accent hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
            <div className="mt-4">
              <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                Current: {order.status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                    <div className="flex items-center flex-1">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        {item.product_image ? (
                          <img
                            src={`http://localhost/wrightcommerce/public/uploads/${item.product_image}`}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <FiPackage className="text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          KES {parseFloat(item.price).toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        KES {(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items in this order</p>
              )}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {parseFloat(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <FiUser className="text-gray-400 mt-1 mr-3" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customer_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiMail className="text-gray-400 mt-1 mr-3" size={16} />
                <div>
                  <p className="text-sm text-gray-600">{order.customer_email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiPhone className="text-gray-400 mt-1 mr-3" size={16} />
                <div>
                  <p className="text-sm text-gray-600">{order.customer_phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h2>
            <div className="flex items-start">
              <FiMapPin className="text-gray-400 mt-1 mr-3" size={16} />
              <div>
                  <p className="text-sm text-gray-600">
                    {order.shipping_address || `Only note available: ${order.notes}` || 'No shipping address provided'}
                  </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment_status || 'unpaid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Method</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.payment_method || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">
                  KES {parseFloat(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiCalendar className="text-gray-400 mr-3" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {order.updated_at && order.updated_at !== order.created_at && (
                <div className="flex items-center">
                  <FiTruck className="text-gray-400 mr-3" size={16} />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(order.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
