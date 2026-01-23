import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (phone, name, password) => {
    const response = await axios.post(`${API}/auth/signup`, { phone, name, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const login = async (phone, password) => {
    const response = await axios.post(`${API}/auth/login`, { phone, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const adminLogin = async (username, password) => {
    const response = await axios.post(`${API}/admin/login?username=${username}&password=${password}`);
    const userData = { ...response.data, id: 'admin', role: 'admin' };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateAddress = async (address) => {
    if (user && user.id) {
      const response = await axios.put(`${API}/users/${user.id}/address?address=${encodeURIComponent(address)}`);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, adminLogin, logout, updateAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};