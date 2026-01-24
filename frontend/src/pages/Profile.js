import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Leaf, User, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const [address, setAddress] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateAddress, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddress(user.address || '');
    fetchPayments();
  }, [user, navigate]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments?user_id=${user.id}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to load payments');
    }
  };

  const handleSaveAddress = async () => {
    setLoading(true);
    try {
      await updateAddress(address);
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary heading-text">Khurpi</h1>
          </div>
          <div className="flex gap-3">
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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-primary mb-8 heading-text">My Profile</h2>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-primary heading-text">Personal Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={user?.name || ''} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={user?.phone || ''} disabled className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-primary heading-text">Delivery Address</h3>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  data-testid="address-input"
                  placeholder="Enter your delivery address in NOIDA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  * We currently deliver only in NOIDA area
                </p>
                <Button
                  data-testid="save-address-button"
                  onClick={handleSaveAddress}
                  disabled={loading}
                  className="mt-4 bg-primary hover:bg-primary/90 rounded-full"
                >
                  {loading ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-primary heading-text">Payment History</h3>
              </div>
              {payments.length === 0 ? (
                <p className="text-muted-foreground">No payment history yet</p>
              ) : (
                <div className="space-y-3" data-testid="payment-history">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      data-testid={`payment-${payment.id}`}
                      className="flex justify-between items-center p-3 bg-background rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-primary">₹{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">
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

          <Card>
            <CardContent className="p-6">
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

import { Badge } from '@/components/ui/badge';

export default Profile;