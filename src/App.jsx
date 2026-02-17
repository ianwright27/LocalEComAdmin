/**
 * App.jsx - WITH ORDERS ROUTES
 * Replace your existing App.jsx with this file
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import Dashboard from './pages/Dashboard';

// Product Pages
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

// Order Pages
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

// Placeholder pages
const Customers = () => <div className="p-8"><h1 className="text-2xl font-bold">Customers - Coming Soon</h1></div>;
const Payments = () => <div className="p-8"><h1 className="text-2xl font-bold">Payments - Coming Soon</h1></div>;
const Notifications = () => <div className="p-8"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Products */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AdminLayout><Products /></AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/products/add"
            element={
              <ProtectedRoute>
                <AdminLayout><AddProduct /></AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/products/edit/:id"
            element={
              <ProtectedRoute>
                <AdminLayout><EditProduct /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AdminLayout><Orders /></AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <AdminLayout><OrderDetails /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Customers */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <AdminLayout><Customers /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Payments */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AdminLayout><Payments /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AdminLayout><Notifications /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout><Settings /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Not Found */}
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
