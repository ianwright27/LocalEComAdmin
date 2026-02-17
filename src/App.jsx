/**
 * App.jsx 
 * WITH CUSTOMER ROUTES
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';

// Placeholder pages
const Payments = () => <div className="p-8"><h1 className="text-2xl font-bold">Payments - Coming Soon</h1></div>;
const Notifications = () => <div className="p-8"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>;

const wrap = (Component) => (
  <ProtectedRoute>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover />
        
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={wrap(Dashboard)} />

          {/* Products */}
          <Route path="/products" element={wrap(Products)} />
          <Route path="/products/add" element={wrap(AddProduct)} />
          <Route path="/products/edit/:id" element={wrap(EditProduct)} />

          {/* Orders */}
          <Route path="/orders" element={wrap(Orders)} />
          <Route path="/orders/:id" element={wrap(OrderDetails)} />

          {/* Customers */}
          <Route path="/customers" element={wrap(Customers)} />
          <Route path="/customers/:id" element={wrap(CustomerDetails)} />

          {/* Payments */}
          <Route path="/payments" element={wrap(Payments)} />

          {/* Notifications */}
          <Route path="/notifications" element={wrap(Notifications)} />

          {/* Settings */}
          <Route path="/settings" element={wrap(Settings)} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                <a href="/dashboard" className="px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-orange-600">
                  Go to Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
