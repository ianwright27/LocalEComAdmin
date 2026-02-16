/**
 * App.jsx
 * Main application component with routing
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

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';

// Placeholder pages (we'll build these next)
const Products = () => <div>Products Page - Coming Soon</div>;
const Orders = () => <div>Orders Page - Coming Soon</div>;
const Customers = () => <div>Customers Page - Coming Soon</div>;
const Payments = () => <div>Payments Page - Coming Soon</div>;
const Notifications = () => <div>Notifications Page - Coming Soon</div>;
const Settings = () => <div>Settings Page - Coming Soon</div>;

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
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Customers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Payments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Notifications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
