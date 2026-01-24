import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Leaf, User, MapPin, CreditCard, Plus, Trash2, Edit2, Star, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import LocationPicker from '@/components/LocationPicker';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, addresses, addAddress, updateAddressById, deleteAddress, setDefaultAddress, logout, fetchAddresses } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPayments();
    fetchAddresses();
  }, [user, navigate]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments?user_id=${user.id}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to load payments');
    }
  };

  const handleAddAddress = async (addressData) => {
    setLoading(true);
    try {
      await addAddress(addressData);
      setShowAddAddress(false);
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (addressData) => {
    if (!editingAddress) return;
    setLoading(true);
    try {
      await updateAddressById(editingAddress.id, addressData);
      setEditingAddress(null);
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(addressId);
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary heading-text">Khurpi</h1>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden sm:flex gap-3">
            <Button
              data-testid="products-nav-button"
              variant="ghost"
              onClick={() => navigate('/products')}
              className="rounded-full"
            >
              Products
            </Button>
            <Button
              data-testid="subscriptions-nav-button"
              variant="ghost"
              onClick={() => navigate('/subscriptions')}
              className="rounded-full"
            >
              My Subscriptions
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-green-100 px-4 py-3 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
            >
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => { navigate('/subscriptions'); setMobileMenuOpen(false); }}
            >
              My Subscriptions
            </Button>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8 heading-text">My Profile</h2>

        <div className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold text-primary heading-text">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input value={user?.name || ''} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <Input value={user?.phone || ''} disabled className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Addresses */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary heading-text">Delivery Addresses</h3>
                </div>
                {!showAddAddress && !editingAddress && (
                  <Button
                    data-testid="add-address-button"
                    onClick={() => setShowAddAddress(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Address
                  </Button>
                )}
              </div>

              {/* Add New Address Form */}
              {showAddAddress && (
                <div className="mb-4">
                  <LocationPicker
                    onSave={handleAddAddress}
                    onCancel={() => setShowAddAddress(false)}
                    loading={loading}
                    showSetDefault={addresses.length > 0}
                    isDefault={addresses.length === 0}
                  />
                </div>
              )}

              {/* Edit Address Form */}
              {editingAddress && (
                <div className="mb-4">
                  <LocationPicker
                    initialAddress={editingAddress.address_line}
                    initialLat={editingAddress.latitude}
                    initialLng={editingAddress.longitude}
                    onSave={handleUpdateAddress}
                    onCancel={() => setEditingAddress(null)}
                    loading={loading}
                    isEdit={true}
                    showSetDefault={true}
                    isDefault={editingAddress.is_default}
                  />
                </div>
              )}

              {/* Address List */}
              {!showAddAddress && !editingAddress && (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 bg-green-50 rounded-lg">
                      <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm sm:text-base">No addresses added yet</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Add your first delivery address</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        data-testid={`address-${addr.id}`}
                        className={`p-3 sm:p-4 rounded-lg border ${
                          addr.is_default ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {addr.is_default && (
                                <Badge className="bg-primary text-white text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line break-words">
                              {addr.address_line}
                            </p>
                            {addr.latitude && addr.longitude && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Location: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2">
                            {!addr.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-xs flex-1 sm:flex-none"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAddress(addr)}
                              className="text-xs flex-1 sm:flex-none"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold text-primary heading-text">Payment History</h3>
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground text-sm sm:text-base">No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="payment-history">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      data-testid={`payment-${payment.id}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-primary text-sm sm:text-base">₹{payment.amount}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(payment.payment_date), 'PPP')}
                        </p>
                      </div>
                      <Badge
                        className={payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <Button
                data-testid="logout-button"
                onClick={handleLogout}
                variant="destructive"
                className="w-full rounded-full"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
