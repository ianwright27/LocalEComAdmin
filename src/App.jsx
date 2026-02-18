/**
 * App.jsx - FINAL COMPLETE 
 * WrightCommerce Admin Dashboard
 * All routes wired up: Dashboard, Products, Orders, Customers, Payments, Settings
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

// Wrap a page in ProtectedRoute + AdminLayout
const Page = ({ children }) => (
  <ProtectedRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

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
          pauseOnHover
        />

        <Routes>
          {/* ── Public ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={<Page><Dashboard /></Page>} />

          {/* ── Products ── */}
          <Route path="/products" element={<Page><Products /></Page>} />
          <Route path="/products/add" element={<Page><AddProduct /></Page>} />
          <Route path="/products/edit/:id" element={<Page><EditProduct /></Page>} />

          {/* ── Orders ── */}
          <Route path="/orders" element={<Page><Orders /></Page>} />
          <Route path="/orders/:id" element={<Page><OrderDetails /></Page>} />

          {/* ── Customers ── */}
          <Route path="/customers" element={<Page><Customers /></Page>} />
          <Route path="/customers/:id" element={<Page><CustomerDetails /></Page>} />

          {/* ── Payments ── */}
          <Route path="/payments" element={<Page><Payments /></Page>} />

          {/* ── Settings ── */}
          <Route path="/settings" element={<Page><Settings /></Page>} />

          {/* ── Redirects ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-orange-600"
                >
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
