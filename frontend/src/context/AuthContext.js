import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fetch addresses when user changes
  useEffect(() => {
    if (user && user.id && user.role !== 'admin') {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [user?.id]);

  const fetchAddresses = async () => {
    if (user && user.id) {
      try {
        const response = await axios.get(`${API}/users/${user.id}/addresses`);
        setAddresses(response.data);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    }
  };

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
    setAddresses([]);
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

  const addAddress = async (addressData) => {
    if (user && user.id) {
      const response = await axios.post(`${API}/users/${user.id}/addresses`, addressData);
      await fetchAddresses();
      // Update user if this is now the default address
      if (response.data.is_default) {
        const updatedUser = { ...user, address: response.data.address_line };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    }
  };

  const updateAddressById = async (addressId, addressData) => {
    if (user && user.id) {
      const response = await axios.put(`${API}/users/${user.id}/addresses/${addressId}`, addressData);
      await fetchAddresses();
      // Update user if this is now the default address
      if (response.data.is_default) {
        const updatedUser = { ...user, address: response.data.address_line };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    }
  };

  const deleteAddress = async (addressId) => {
    if (user && user.id) {
      await axios.delete(`${API}/users/${user.id}/addresses/${addressId}`);
      await fetchAddresses();
      // Refetch user to get updated default address
      const response = await axios.post(`${API}/auth/login`, { phone: user.phone, password: 'dummy' }).catch(() => null);
      if (response) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    }
  };

  const setDefaultAddress = async (addressId) => {
    if (user && user.id) {
      await axios.put(`${API}/users/${user.id}/addresses/${addressId}/set-default`);
      await fetchAddresses();
      const address = addresses.find(a => a.id === addressId);
      if (address) {
        const updatedUser = { ...user, address: address.address_line };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      addresses,
      signup, 
      login, 
      adminLogin, 
      logout, 
      updateAddress,
      addAddress,
      updateAddressById,
      deleteAddress,
      setDefaultAddress,
      fetchAddresses
    }}>
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