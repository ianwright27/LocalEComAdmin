/**
 * Sidebar Component - FIXED RESPONSIVE VERSION
 * Keeps original blue design, adds mobile overlay functionality
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import branding from '../../config/branding';

const SideBar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/products', icon: FiPackage, label: 'Products' },
    { path: '/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/customers', icon: FiUsers, label: 'Customers' },
    { path: '/payments', icon: FiDollarSign, label: 'Payments' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      onClose?.(); // Close sidebar on mobile after logout
    }
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    onClose?.();
  };

  return (
    <>
      {/* Backdrop overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          h-screen w-64 bg-brand-primary text-white fixed left-0 top-0 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo with Close Button */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-accent rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">{branding.client.businessName}</h1>
                <p className="text-xs text-white/60">Admin Panel</p>
              </div>
            </div>
            {/* Close button - only visible on mobile/tablet */}
            <button
              onClick={onClose}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-brand-accent text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-white/60 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            <FiLogOut className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">
            {branding.platform.footer}
          </p>
        </div>
      </div>
    </>
  );
};

export default SideBar;
