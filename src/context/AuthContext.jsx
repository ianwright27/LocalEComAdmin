/**
 * AuthContext
 * Global authentication state management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      toast.success('Login successful!');
      return userData;
    } catch (error) {
      toast.error(error || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      toast.success('Registration successful!');
      return newUser;
    } catch (error) {
      toast.error(error || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
