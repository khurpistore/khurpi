import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Settings, Palette, MapPin, Truck, Phone, Sparkles, Save, Plus, X } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAppConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    // Branding
    app_name: 'Khurpi Fresh',
    app_tagline: 'Fresh from Farm to Table',
    logo_url: '',
    
    // Colors
    primary_color: '#4CAF50',
    primary_dark_color: '#388E3C',
    secondary_color: '#FFC107',
    accent_color: '#FF5722',
    background_color: '#F5F5F5',
    surface_color: '#FFFFFF',
    error_color: '#F44336',
    success_color: '#4CAF50',
    
    // Typography
    font_family: 'Poppins',
    heading_font_size: 24,
    body_font_size: 14,
    caption_font_size: 12,
    
    // Service Areas
    supported_countries: ['India'],
    supported_states: [],
    supported_cities: [],
    supported_pincodes: [],
    supported_societies: [],
    
    // Delivery
    min_order_value: 100,
    free_delivery_threshold: 500,
    default_delivery_fee: 40,
    
    // Features
    enable_cod: true,
    enable_online_payment: true,
    enable_subscriptions: true,
    enable_referrals: true,
    enable_spin_wheel: true,
    
    // Contact
    support_phone: '',
    support_email: '',
    support_whatsapp: ''
  });

  const [newPincode, setNewPincode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newSociety, setNewSociety] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API}/admin/config`);
      setConfig(prev => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/admin/config`, config);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addToList = (field, value, setValue) => {
    if (!value.trim()) return;
    if (!config[field].includes(value.trim())) {
      setConfig(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
    setValue('');
  };

  const removeFromList = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].filter(v => v !== value)
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" /> App Configuration
            </h1>
            <p className="text-muted-foreground">Manage app settings, colors, and service areas</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="areas">Service Areas</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Branding & Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>App Name</Label>
                    <Input
                      value={config.app_name}
                      onChange={(e) => setConfig({...config, app_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={config.app_tagline}
                      onChange={(e) => setConfig({...config, app_tagline: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={config.logo_url || ''}
                      onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Font Family</Label>
                    <Input
                      value={config.font_family}
                      onChange={(e) => setConfig({...config, font_family: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Heading Font Size</Label>
                    <Input
                      type="number"
                      value={config.heading_font_size}
                      onChange={(e) => setConfig({...config, heading_font_size: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Body Font Size</Label>
                    <Input
                      type="number"
                      value={config.body_font_size}
                      onChange={(e) => setConfig({...config, body_font_size: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Caption Font Size</Label>
                    <Input
                      type="number"
                      value={config.caption_font_size}
                      onChange={(e) => setConfig({...config, caption_font_size: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Support Phone</Label>
                      <Input
                        value={config.support_phone || ''}
                        onChange={(e) => setConfig({...config, support_phone: e.target.value})}
                        placeholder="+91 9999999999"
                      />
                    </div>
                    <div>
                      <Label>Support Email</Label>
                      <Input
                        value={config.support_email || ''}
                        onChange={(e) => setConfig({...config, support_email: e.target.value})}
                        placeholder="support@example.com"
                      />
                    </div>
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input
                        value={config.support_whatsapp || ''}
                        onChange={(e) => setConfig({...config, support_whatsapp: e.target.value})}
                        placeholder="+91 9999999999"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" /> App Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { key: 'primary_color', label: 'Primary' },
                    { key: 'primary_dark_color', label: 'Primary Dark' },
                    { key: 'secondary_color', label: 'Secondary' },
                    { key: 'accent_color', label: 'Accent' },
                    { key: 'background_color', label: 'Background' },
                    { key: 'surface_color', label: 'Surface' },
                    { key: 'error_color', label: 'Error' },
                    { key: 'success_color', label: 'Success' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config[key]}
                          onChange={(e) => setConfig({...config, [key]: e.target.value})}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={config[key]}
                          onChange={(e) => setConfig({...config, [key]: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Color Preview */}
                <div className="mt-6 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Preview</h4>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-16 h-16 rounded-lg shadow" 
                        style={{ backgroundColor: config.primary_color }}
                      ></div>
                      <span className="text-xs">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-16 h-16 rounded-lg shadow" 
                        style={{ backgroundColor: config.secondary_color }}
                      ></div>
                      <span className="text-xs">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-16 h-16 rounded-lg shadow" 
                        style={{ backgroundColor: config.accent_color }}
                      ></div>
                      <span className="text-xs">Accent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Areas Tab */}
          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Supported Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pincodes */}
                <div>
                  <Label className="text-base font-semibold">Pincodes</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="Enter pincode"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('supported_pincodes', newPincode, setNewPincode)}
                    />
                    <Button onClick={() => addToList('supported_pincodes', newPincode, setNewPincode)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.supported_pincodes.map(pin => (
                      <span key={pin} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                        {pin}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('supported_pincodes', pin)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cities */}
                <div>
                  <Label className="text-base font-semibold">Cities</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Enter city name"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('supported_cities', newCity, setNewCity)}
                    />
                    <Button onClick={() => addToList('supported_cities', newCity, setNewCity)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.supported_cities.map(city => (
                      <span key={city} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                        {city}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('supported_cities', city)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* States */}
                <div>
                  <Label className="text-base font-semibold">States</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="Enter state name"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('supported_states', newState, setNewState)}
                    />
                    <Button onClick={() => addToList('supported_states', newState, setNewState)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.supported_states.map(state => (
                      <span key={state} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                        {state}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('supported_states', state)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Societies */}
                <div>
                  <Label className="text-base font-semibold">Societies / Apartments</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSociety}
                      onChange={(e) => setNewSociety(e.target.value)}
                      placeholder="Enter society name"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('supported_societies', newSociety, setNewSociety)}
                    />
                    <Button onClick={() => addToList('supported_societies', newSociety, setNewSociety)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.supported_societies.map(society => (
                      <span key={society} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                        {society}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('supported_societies', society)} />
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Delivery Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Minimum Order Value (₹)</Label>
                    <Input
                      type="number"
                      value={config.min_order_value}
                      onChange={(e) => setConfig({...config, min_order_value: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Free Delivery Above (₹)</Label>
                    <Input
                      type="number"
                      value={config.free_delivery_threshold}
                      onChange={(e) => setConfig({...config, free_delivery_threshold: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Default Delivery Fee (₹)</Label>
                    <Input
                      type="number"
                      value={config.default_delivery_fee}
                      onChange={(e) => setConfig({...config, default_delivery_fee: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'enable_cod', label: 'Cash on Delivery', desc: 'Allow COD payment' },
                    { key: 'enable_online_payment', label: 'Online Payment', desc: 'Allow online payments' },
                    { key: 'enable_subscriptions', label: 'Subscriptions', desc: 'Enable subscription plans' },
                    { key: 'enable_referrals', label: 'Referral Program', desc: 'Enable referral rewards' },
                    { key: 'enable_spin_wheel', label: 'Spin Wheel Game', desc: 'Show spin wheel on home' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={config[key]}
                        onCheckedChange={(checked) => setConfig({...config, [key]: checked})}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAppConfig;
