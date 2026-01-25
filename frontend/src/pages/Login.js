import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Leaf, ArrowLeft, Loader2, Phone, MessageSquare } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'name'
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const { loginWithOTP, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const otpRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/products';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    
    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, { phone });
      
      if (response.data.success) {
        toast.success('OTP sent to your phone!');
        setStep('otp');
        setCountdown(30);
        
        // For testing - show OTP if provided
        if (response.data.debug_otp) {
          toast.info(`Test OTP: ${response.data.debug_otp}`, { duration: 10000 });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = [...otp];
      digits.split('').forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, '');
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        phone,
        otp: otpString,
        name: name || undefined
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        
        if (response.data.is_new_user) {
          setIsNewUser(true);
          setStep('name');
          toast.success('Phone verified! Please enter your name.');
        } else {
          // Existing user - login directly
          loginWithOTP(userData);
          toast.success(`Welcome back, ${userData.name}!`);
          const from = location.state?.from?.pathname || '/products';
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteName = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setLoading(true);
    try {
      // Re-verify with name to update user
      const response = await axios.post(`${API}/auth/verify-otp`, {
        phone,
        otp: otp.join(''),
        name: name.trim()
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        loginWithOTP(userData);
        toast.success(`Welcome to Khurpi, ${name}!`);
        navigate('/products');
      }
    } catch (error) {
      // User already created, try to login
      try {
        const loginRes = await axios.post(`${API}/auth/login`, { phone, password: 'dummy' });
        const userData = loginRes.data;
        
        // Update name if needed
        if (name.trim() && userData.name !== name.trim()) {
          await axios.put(`${API}/users/${userData.id}`, { name: name.trim() });
          userData.name = name.trim();
        }
        
        loginWithOTP(userData);
        toast.success(`Welcome to Khurpi, ${name}!`);
        navigate('/products');
      } catch (err) {
        toast.error('Something went wrong. Please try again.');
        setStep('phone');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
    } else if (step === 'name') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-green-50 to-white">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/khurpi-logo.png" alt="Khurpi" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl text-primary">
            {step === 'phone' && 'Welcome to Khurpi'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'name' && 'Complete Profile'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' && 'Login or signup with your phone number'}
            {step === 'otp' && `Enter the 6-digit OTP sent to +91 ${phone}`}
            {step === 'name' && 'Almost there! Tell us your name'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Phone Number Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <div className="flex mt-1">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-sm text-muted-foreground">
                    +91
                  </div>
                  <Input
                    id="phone"
                    data-testid="login-phone-input"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="rounded-l-none"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>
              
              <Button
                data-testid="send-otp-button"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
                disabled={loading || phone.length !== 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send OTP via WhatsApp
                  </>
                )}
              </Button>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Change number
              </button>
              
              <div>
                <Label className="mb-2 block">Enter OTP</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <Button
                data-testid="verify-otp-button"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in <span className="font-semibold text-primary">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Name Entry Step (New Users) */}
          {step === 'name' && (
            <form onSubmit={handleCompleteName} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  data-testid="user-name-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              
              <Button
                data-testid="complete-signup-button"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Start Shopping'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Admin?{' '}
              <Link to="/admin/login" className="text-primary font-medium hover:underline">
                Admin Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
