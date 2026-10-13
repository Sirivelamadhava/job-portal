import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Hydrate user profile on load or token change
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.data.user) {
        setUser(res.data.data.user);
        setCompany(res.data.data.company || null);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err?.response?.data?.message || err.message);
      localStorage.removeItem('token');
      setUser(null);
      setCompany(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token: jwtToken, company: companyData } = res.data.data;
      
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      setCompany(companyData || null);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { user: userData, token: jwtToken, company: companyData } = res.data.data;

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      setCompany(companyData || null);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      const errors = err.response?.data?.errors;
      return { success: false, error: errorMsg, errors };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  // Update local user state
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    company,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    updateUser,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
