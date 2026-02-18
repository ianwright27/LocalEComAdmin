/**
 * Settings Page
 * Business profile, notification preferences, account settings
 */

import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBell,
  FiLock,
  FiSave,
  FiCheck,
  FiGlobe,
  FiShoppingBag,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';

const TAB_BUSINESS = 'business';
const TAB_NOTIFICATIONS = 'notifications';
const TAB_ACCOUNT = 'account';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(TAB_BUSINESS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business Profile
  const [business, setBusiness] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
    website: '',
    description: '',
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email_new_order: true,
    email_order_status: true,
    email_low_stock: true,
    sms_new_order: false,
    sms_order_status: false,
    whatsapp_new_order: false,
    whatsapp_order_status: false,
  });

  // Account / Password
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/business/profile');
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setBusiness({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'Kenya',
          currency: data.currency || 'KES',
          website: data.website || '',
          description: data.description || '',
        });
        if (data.notification_preferences) {
          setNotifications(data.notification_preferences);
        }
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      // Non-fatal — page still renders with empty defaults
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessProfile = async () => {
    try {
      setSaving(true);
      await api.put('/api/v1/business/profile', business);
      toast.success('Business profile saved!');
    } catch (error) {
      console.error('Save business error:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSaving(true);
      await api.put('/api/v1/business/notifications', notifications);
      toast.success('Notification preferences saved!');
    } catch (error) {
      console.error('Save notifications error:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    try {
      setSaving(true);
      console.log('Changing password with form data:', passwordForm);
      await api.put('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: TAB_BUSINESS, label: 'Business Profile', icon: FiShoppingBag },
    { id: TAB_NOTIFICATIONS, label: 'Notifications', icon: FiBell },
    { id: TAB_ACCOUNT, label: 'Account & Security', icon: FiLock },
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your business profile and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm text-left transition-colors border-l-4 ${
                    activeTab === tab.id
                      ? 'border-brand-accent bg-orange-50 text-brand-accent font-medium'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3" size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">

          {/* ── BUSINESS PROFILE TAB ── */}
          {activeTab === TAB_BUSINESS && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">Business Profile</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Business Name</label>
                  <div className="relative">
                    <FiShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      value={business.name}
                      onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                      placeholder="e.g. Wright Electronics"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Business Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="email"
                      value={business.email}
                      onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                      placeholder="hello@yourbusiness.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      value={business.phone}
                      onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                      placeholder="+254 700 000 000"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      value={business.website}
                      onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                      placeholder="https://yourbusiness.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                  <select
                    value={business.currency}
                    onChange={(e) => setBusiness({ ...business, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  >
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="UGX">UGX — Ugandan Shilling</option>
                    <option value="TZS">TZS — Tanzanian Shilling</option>
                    <option value="RWF">RWF — Rwandan Franc</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400" size={14} />
                    <input
                      type="text"
                      value={business.address}
                      onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                      placeholder="Street address"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={business.city}
                    onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                    placeholder="Nairobi"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                  <select
                    value={business.country}
                    onChange={(e) => setBusiness({ ...business, country: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  >
                    <option>Kenya</option>
                    <option>Uganda</option>
                    <option>Tanzania</option>
                    <option>Rwanda</option>
                    <option>Ethiopia</option>
                    <option>Nigeria</option>
                    <option>Ghana</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Business Description</label>
                  <textarea
                    value={business.description}
                    onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of your business..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveBusinessProfile}
                  disabled={saving}
                  className="flex items-center px-5 py-2 bg-brand-accent hover:bg-orange-600 text-white text-sm rounded-lg disabled:opacity-50"
                >
                  <FiSave className="mr-2" size={14} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === TAB_NOTIFICATIONS && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">Notification Preferences</h2>
              <p className="text-xs text-gray-500 mb-6">
                Choose how you want to be notified about activity in your store.
                These connect to your Africa's Talking SMS and Meta WhatsApp integrations.
              </p>

              {/* Email Notifications */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <FiMail className="text-gray-500 mr-2" size={15} />
                  <h3 className="text-sm font-semibold text-gray-700">Email Notifications</h3>
                </div>
                <div className="space-y-3 pl-6">
                  {[
                    { key: 'email_new_order', label: 'New order placed', desc: 'Get notified when a customer places an order' },
                    { key: 'email_order_status', label: 'Order status changes', desc: 'Get notified when an order status is updated' },
                    { key: 'email_low_stock', label: 'Low stock alerts', desc: 'Get notified when a product stock falls below 10' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start justify-between cursor-pointer group">
                      <div>
                        <p className="text-sm text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className={`relative ml-4 flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${
                          notifications[key] ? 'bg-brand-accent' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notifications[key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <FiPhone className="text-gray-500 mr-2" size={15} />
                  <h3 className="text-sm font-semibold text-gray-700">SMS Notifications</h3>
                  <span className="ml-2 text-xs text-gray-400">(via Africa's Talking)</span>
                </div>
                <div className="space-y-3 pl-6">
                  {[
                    { key: 'sms_new_order', label: 'New order placed' },
                    { key: 'sms_order_status', label: 'Order status changes' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <p className="text-sm text-gray-800">{label}</p>
                      <div
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${
                          notifications[key] ? 'bg-brand-accent' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notifications[key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* WhatsApp Notifications */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <FiBell className="text-gray-500 mr-2" size={15} />
                  <h3 className="text-sm font-semibold text-gray-700">WhatsApp Notifications</h3>
                  <span className="ml-2 text-xs text-gray-400">(via Meta WhatsApp API)</span>
                </div>
                <div className="space-y-3 pl-6">
                  {[
                    { key: 'whatsapp_new_order', label: 'New order placed' },
                    { key: 'whatsapp_order_status', label: 'Order status changes' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <p className="text-sm text-gray-800">{label}</p>
                      <div
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${
                          notifications[key] ? 'bg-brand-accent' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notifications[key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveNotifications}
                  disabled={saving}
                  className="flex items-center px-5 py-2 bg-brand-accent hover:bg-orange-600 text-white text-sm rounded-lg disabled:opacity-50"
                >
                  <FiSave className="mr-2" size={14} />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ── ACCOUNT & SECURITY TAB ── */}
          {activeTab === TAB_ACCOUNT && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-5">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      placeholder="Repeat new password"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={savePassword}
                      disabled={saving}
                      className="flex items-center px-5 py-2 bg-brand-accent hover:bg-orange-600 text-white text-sm rounded-lg disabled:opacity-50"
                    >
                      <FiLock className="mr-2" size={14} />
                      {saving ? 'Saving...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Info - read only */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Account Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Platform</span>
                    <span className="font-medium text-gray-800">WrightCommerce</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium text-gray-800">Standard</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Region</span>
                    <span className="font-medium text-gray-800">East Africa</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Modules</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {['Core', 'Payments', 'Notifications'].map(m => (
                        <span key={m} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                          <FiCheck size={10} className="mr-1" />{m}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                        WrightAnalytics (soon)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
