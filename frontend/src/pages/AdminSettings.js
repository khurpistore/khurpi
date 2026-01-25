import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Store, Truck, Tag, Plus, Trash2, Save, FileText, Shield } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopConfig, setShopConfig] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: ''
  });
  const [deliveryPricing, setDeliveryPricing] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [pages, setPages] = useState({
    'privacy-policy': '',
    'terms-of-service': ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings/all`);
      setShopConfig(response.data.shop_config);
      setDeliveryPricing(response.data.delivery_pricing);
      setSubscriptionPlans(response.data.subscription_plans);
      
      // Load pages content
      const pagesData = response.data.pages || [];
      const pagesMap = {};
      pagesData.forEach(p => {
        pagesMap[p.slug] = p.content || '';
      });
      setPages(prev => ({ ...prev, ...pagesMap }));
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShopConfig = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/shop`, shopConfig);
      toast.success('Shop settings saved');
    } catch (error) {
      toast.error('Failed to save shop settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDeliveryPricing = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/delivery-pricing`, deliveryPricing);
      toast.success('Delivery pricing saved');
    } catch (error) {
      toast.error('Failed to save delivery pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubscriptionPlans = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/subscription-plans`, subscriptionPlans);
      toast.success('Subscription plans saved');
    } catch (error) {
      toast.error('Failed to save subscription plans');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePage = async (slug) => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/pages/${slug}`, { content: pages[slug] });
      toast.success(`${slug === 'privacy-policy' ? 'Privacy Policy' : 'Terms of Service'} saved`);
    } catch (error) {
      toast.error('Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  const addDeliveryTier = () => {
    setDeliveryPricing([...deliveryPricing, { max_distance: 0, fee: 0, label: '' }]);
  };

  const removeDeliveryTier = (index) => {
    setDeliveryPricing(deliveryPricing.filter((_, i) => i !== index));
  };

  const updateDeliveryTier = (index, field, value) => {
    const updated = [...deliveryPricing];
    updated[index][field] = field === 'label' ? value : parseFloat(value) || 0;
    setDeliveryPricing(updated);
  };

  const addSubscriptionPlan = () => {
    const newId = `plan_${Date.now()}`;
    setSubscriptionPlans([...subscriptionPlans, {
      id: newId,
      name: '',
      frequency: '',
      deliveries_per_week: 1,
      discount: 0,
      description: ''
    }]);
  };

  const removeSubscriptionPlan = (index) => {
    setSubscriptionPlans(subscriptionPlans.filter((_, i) => i !== index));
  };

  const updateSubscriptionPlan = (index, field, value) => {
    const updated = [...subscriptionPlans];
    if (field === 'deliveries_per_week' || field === 'discount') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setSubscriptionPlans(updated);
  };

  return (
    <AdminLayout active="settings" title="Settings">
      {loading ? (
        <p className="text-muted-foreground">Loading settings...</p>
      ) : (
        <div className="space-y-6">
          {/* Shop Configuration */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="w-5 h-5" />
                Shop Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Shop Name</Label>
                  <Input
                    value={shopConfig.name}
                    onChange={(e) => setShopConfig({...shopConfig, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Shop Address</Label>
                  <Input
                    value={shopConfig.address}
                    onChange={(e) => setShopConfig({...shopConfig, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={shopConfig.latitude}
                    onChange={(e) => setShopConfig({...shopConfig, latitude: parseFloat(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={shopConfig.longitude}
                    onChange={(e) => setShopConfig({...shopConfig, longitude: parseFloat(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={shopConfig.phone}
                    onChange={(e) => setShopConfig({...shopConfig, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={shopConfig.email}
                    onChange={(e) => setShopConfig({...shopConfig, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveShopConfig}
                disabled={saving}
                className="mt-4 bg-primary hover:bg-primary/90 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Shop Settings
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Pricing */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5" />
                Delivery Pricing (Distance-Based)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Set delivery fees based on distance from shop. Distance is calculated from shop coordinates.
              </p>
              <div className="space-y-3">
                {deliveryPricing.map((tier, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label className="text-xs">Max Distance (km)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={tier.max_distance}
                        onChange={(e) => updateDeliveryTier(index, 'max_distance', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Delivery Fee (₹)</Label>
                      <Input
                        type="number"
                        value={tier.fee}
                        onChange={(e) => updateDeliveryTier(index, 'fee', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={tier.label}
                        onChange={(e) => updateDeliveryTier(index, 'label', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., Free Delivery"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDeliveryTier(index)}
                      className="self-end text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={addDeliveryTier}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
                <Button
                  onClick={handleSaveDeliveryPricing}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 rounded-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Delivery Pricing
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="w-5 h-5" />
                Subscription Plans & Discounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Configure subscription frequencies and their discount percentages.
              </p>
              <div className="space-y-4">
                {subscriptionPlans.map((plan, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Plan ID</Label>
                        <Input
                          value={plan.id}
                          onChange={(e) => updateSubscriptionPlan(index, 'id', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Plan Name</Label>
                        <Input
                          value={plan.name}
                          onChange={(e) => updateSubscriptionPlan(index, 'name', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., Weekly Plan"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Frequency Key</Label>
                        <Input
                          value={plan.frequency}
                          onChange={(e) => updateSubscriptionPlan(index, 'frequency', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., weekly"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Deliveries/Week</Label>
                        <Input
                          type="number"
                          value={plan.deliveries_per_week}
                          onChange={(e) => updateSubscriptionPlan(index, 'deliveries_per_week', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Discount (%)</Label>
                        <Input
                          type="number"
                          value={plan.discount}
                          onChange={(e) => updateSubscriptionPlan(index, 'discount', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubscriptionPlan(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={plan.description || ''}
                        onChange={(e) => updateSubscriptionPlan(index, 'description', e.target.value)}
                        className="mt-1"
                        placeholder="Brief description of this plan"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={addSubscriptionPlan}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plan
                </Button>
                <Button
                  onClick={handleSaveSubscriptionPlans}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 rounded-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Subscription Plans
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-lg text-green-800">Current Configuration Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Delivery Zones</h4>
                  <ul className="space-y-1 text-green-700">
                    {deliveryPricing.sort((a, b) => a.max_distance - b.max_distance).map((tier, i) => (
                      <li key={i}>
                        Up to {tier.max_distance} km: ₹{tier.fee} ({tier.label})
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Subscription Discounts</h4>
                  <ul className="space-y-1 text-green-700">
                    {subscriptionPlans.map((plan, i) => (
                      <li key={i}>
                        {plan.name}: {plan.discount}% off
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
