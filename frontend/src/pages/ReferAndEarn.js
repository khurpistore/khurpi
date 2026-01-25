import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Gift, Copy, Check, Share2, IndianRupee, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReferAndEarn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const response = await axios.get(`${API}/user/${user.id}/referral`);
      setReferralData(response.data);
    } catch (error) {
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
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success('Share message copied to clipboard!');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Gift className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Refer & Earn</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : referralData ? (
          <div className="space-y-6">
            {/* Referral Code Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-3xl sm:text-4xl font-bold text-primary bg-white px-6 py-3 rounded-xl border-2 border-primary/20 tracking-wider">
                      {referralData.referral_code}
                    </code>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={copyReferralCode}
                    className="rounded-full"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                  <Button 
                    onClick={shareReferral}
                    className="rounded-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold">{referralData.total_referrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <IndianRupee className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold">₹{referralData.total_earned || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <IndianRupee className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold">₹{referralData.pending_amount || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
            </div>

            {/* How it works */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary">How it works</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Share your code</p>
                      <p className="text-sm text-muted-foreground">Share your unique referral code with friends and family</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">They get 10% off</p>
                      <p className="text-sm text-muted-foreground">Your friends get 10% discount on their first order</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">You earn commission</p>
                      <p className="text-sm text-muted-foreground">Earn {referralData.commission_rate || 10}% commission on every purchase they make</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8 sm:p-12 text-center">
              <Gift className="w-16 h-16 mx-auto text-primary/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start Earning Today!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Generate your unique referral code and earn commission every time your friends order from Khurpi.
              </p>
              <Button 
                onClick={generateReferralCode} 
                disabled={generating}
                size="lg"
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReferAndEarn;
