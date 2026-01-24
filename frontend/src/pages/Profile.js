import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { User, MapPin, ShoppingBag, CalendarCheck, ChevronRight, Gift, Copy, Check, Share2, IndianRupee, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReferralData();
  }, [user, navigate]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/user/${user.id}/referral`);
      setReferralData(response.data);
    } catch (error) {
      // User doesn't have a referral code yet - that's okay
      setReferralData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/user/${user.id}/referral/generate`);
      setReferralData(response.data);
      toast.success('Referral code generated! Start sharing to earn commission.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referral_code) {
      navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = () => {
    if (referralData?.referral_code) {
      const shareText = `🌱 Get 10% off on your first Khurpi microgreens order! Use my referral code: ${referralData.referral_code}\n\nOrder fresh microgreens at: ${window.location.origin}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Khurpi Microgreens Referral',
          text: shareText,
        }).catch(() => {
          // User cancelled sharing
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success('Share message copied to clipboard!');
      }
    }
  };

  if (!user) return null;

  const quickLinks = [
    { label: 'My Orders', icon: ShoppingBag, path: '/orders', description: 'View your order history' },
    { label: 'My Subscriptions', icon: CalendarCheck, path: '/subscriptions', description: 'Manage your subscriptions' },
    { label: 'My Addresses', icon: MapPin, path: '/addresses', description: 'Manage delivery addresses' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 flex items-center gap-2">
          <User className="w-7 h-7" />
          My Profile
        </h1>

        <div className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <Input value={user?.name || ''} disabled className="mt-1 bg-gray-50" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone Number</Label>
                  <Input value={user?.phone || ''} disabled className="mt-1 bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Section */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Refer & Earn</h3>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : referralData ? (
                <div className="space-y-4">
                  {/* Referral Code */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-2xl font-bold text-primary bg-green-50 px-4 py-2 rounded-lg text-center tracking-wider">
                        {referralData.referral_code}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyReferralCode}
                        className="rounded-full"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={shareReferral}
                        className="rounded-full"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border text-center">
                      <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                      <p className="text-xl font-bold">{referralData.total_referrals || 0}</p>
                      <p className="text-xs text-muted-foreground">Referrals</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border text-center">
                      <IndianRupee className="w-5 h-5 mx-auto text-green-500 mb-1" />
                      <p className="text-xl font-bold">₹{referralData.total_earned || 0}</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border text-center">
                      <IndianRupee className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                      <p className="text-xl font-bold">₹{referralData.pending_amount || 0}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="font-medium text-green-800 mb-2">How it works:</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Share your code with friends</li>
                      <li>• They get <strong>10% off</strong> on their first order</li>
                      <li>• You earn <strong>{referralData.commission_rate || 10}% commission</strong> on their purchase</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Gift className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                  <h4 className="font-semibold mb-2">Start Earning Today!</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate your unique referral code and earn commission when friends order.
                  </p>
                  <Button 
                    onClick={generateReferralCode} 
                    disabled={generating}
                    className="rounded-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Generate My Referral Code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-green-50"
                    onClick={() => navigate(link.path)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <link.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{link.label}</p>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Created */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
