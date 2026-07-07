import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { Store, Truck, Clock, Palette, Save, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminStoreSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/store/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/store/settings`, settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout active="store-settings" title="">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Store Settings</h1>
          <p className="text-muted-foreground">Configure your store settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general"><Store className="w-4 h-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="delivery"><Truck className="w-4 h-4 mr-2" />Delivery</TabsTrigger>
          <TabsTrigger value="hours"><Clock className="w-4 h-4 mr-2" />Hours</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="w-4 h-4 mr-2" />Theme</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic store details displayed to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={settings?.store_name || ''}
                    onChange={(e) => updateSetting('store_name', e.target.value)}
                    placeholder="Your Store Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings?.tagline || ''}
                    onChange={(e) => updateSetting('tagline', e.target.value)}
                    placeholder="Fresh from Farm to Your Table"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={settings?.description || ''}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  placeholder="Store description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={settings?.phone || ''}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={settings?.email || ''}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    placeholder="store@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={settings?.address || ''}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  placeholder="Store address..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Configuration</CardTitle>
              <CardDescription>Configure delivery options and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instant Delivery */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Instant Delivery</h4>
                  <p className="text-sm text-muted-foreground">Allow customers to order for immediate delivery</p>
                </div>
                <Switch
                  checked={settings?.instant_delivery_enabled}
                  onCheckedChange={(checked) => updateSetting('instant_delivery_enabled', checked)}
                />
              </div>

              {settings?.instant_delivery_enabled && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label>Instant Delivery Fee (₹)</Label>
                    <Input
                      type="number"
                      value={settings?.instant_delivery_fee || 0}
                      onChange={(e) => updateSetting('instant_delivery_fee', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Time (minutes)</Label>
                    <Input
                      type="number"
                      value={settings?.instant_delivery_time_minutes || 60}
                      onChange={(e) => updateSetting('instant_delivery_time_minutes', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* Slotted Delivery */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Slotted Delivery</h4>
                  <p className="text-sm text-muted-foreground">Allow customers to choose delivery time slots</p>
                </div>
                <Switch
                  checked={settings?.slotted_delivery_enabled}
                  onCheckedChange={(checked) => updateSetting('slotted_delivery_enabled', checked)}
                />
              </div>

              {/* Subscription */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Subscription Orders</h4>
                  <p className="text-sm text-muted-foreground">Allow customers to subscribe for recurring deliveries</p>
                </div>
                <Switch
                  checked={settings?.subscription_enabled}
                  onCheckedChange={(checked) => updateSetting('subscription_enabled', checked)}
                />
              </div>

              {/* Fees & Minimums */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min Order Value (₹)</Label>
                  <Input
                    type="number"
                    value={settings?.min_order_value || 0}
                    onChange={(e) => updateSetting('min_order_value', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Free Delivery Above (₹)</Label>
                  <Input
                    type="number"
                    value={settings?.min_order_for_free_delivery || 500}
                    onChange={(e) => updateSetting('min_order_for_free_delivery', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Delivery Fee (₹)</Label>
                  <Input
                    type="number"
                    value={settings?.default_delivery_fee || 30}
                    onChange={(e) => updateSetting('default_delivery_fee', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operating Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set your store operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={settings?.opening_time || '07:00'}
                    onChange={(e) => updateSetting('opening_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={settings?.closing_time || '21:00'}
                    onChange={(e) => updateSetting('closing_time', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Display</CardTitle>
              <CardDescription>Customize store appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings?.primary_color || '#16a34a'}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings?.primary_color || '#16a34a'}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      placeholder="#16a34a"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings?.secondary_color || '#22c55e'}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings?.secondary_color || '#22c55e'}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      placeholder="#22c55e"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Show Stock Quantity</h4>
                  <p className="text-sm text-muted-foreground">Display available stock to customers</p>
                </div>
                <Switch
                  checked={settings?.show_stock_quantity}
                  onCheckedChange={(checked) => updateSetting('show_stock_quantity', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AdminLayout>
  );
};

export default AdminStoreSettings;
