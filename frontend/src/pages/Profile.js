import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { User, MapPin, ShoppingBag, CalendarCheck, ChevronRight } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

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
