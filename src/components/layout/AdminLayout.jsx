/**
 * AdminLayout - FINAL FIXED VERSION
 * Desktop: Content starts after sidebar (ml-64)
 * Mobile/Tablet: Content full width
 */

import React, { useState } from 'react';
import SideBar from '../common/SideBar';
import { FiMenu } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content - KEY FIX: lg:ml-64 pushes content right on desktop */}
      <div className="ml-0 lg:ml-64">
        {/* Mobile/Tablet Header with Hamburger */}
        <header className="bg-white shadow-sm lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-700 hover:text-gray-900"
            >
              <FiMenu size={24} />
            </button>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {/* Desktop Date Header */}
          <div className="hidden lg:block mb-6">
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
