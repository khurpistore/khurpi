import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Store, Truck, Tag, Plus, Trash2, Save, FileText, Shield, Gift, Loader2 } from 'lucide-react';

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
    email: '',
    free_delivery_threshold: 1000
  });
  const [supportContact, setSupportContact] = useState({
    support_phone: '',
    support_whatsapp: '',
    support_email: ''
  });
  const [deliveryPricing, setDeliveryPricing] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [pages, setPages] = useState({
    'privacy-policy': '',
    'terms-of-service': ''
  });
  const [referralSettings, setReferralSettings] = useState({
    is_active: true,
    customer_commission_rate: 10,
    referee_discount_percent: 10,
    max_referee_discount: 100,
    min_order_amount: 0,
    first_order_only: true
  });
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    fetchSettings();
  }, [authLoading]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings/all`);
      setShopConfig(response.data.shop_config);
      setDeliveryPricing(response.data.delivery_pricing);
      setSubscriptionPlans(response.data.subscription_plans);

      // Load support contact from store settings (shown in app Get Help)
      try {
        const ss = await axios.get(`${API}/admin/store/settings`);
        setSupportContact({
          support_phone: ss.data.support_phone || '',
          support_whatsapp: ss.data.support_whatsapp || '',
          support_email: ss.data.support_email || ''
        });
      } catch (_) {}
      
      // Load pages content
      const pagesData = response.data.pages || [];
      const pagesMap = {};
      pagesData.forEach(p => {
        pagesMap[p.slug] = p.content || '';
      });
      setPages(prev => ({ ...prev, ...pagesMap }));
      
      // Load referral settings
      if (response.data.referral_settings) {
        setReferralSettings(prev => ({ ...prev, ...response.data.referral_settings }));
      }
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

  const handleSaveSupport = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/store/settings`, supportContact);
      toast.success('Support contact saved');
    } catch (error) {
      toast.error('Failed to save support contact');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDeliveryPricing = async () => {    setSaving(true);
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

  const handleSaveReferralSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/referral-program`, referralSettings);
      toast.success('Referral program settings saved');
    } catch (error) {
      toast.error('Failed to save referral settings');
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
    <>
      {authLoading || loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
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
                <div className="sm:col-span-2">
                  <Label>Free Delivery Threshold (₹)</Label>
                  <Input
                    type="number"
                    value={shopConfig.free_delivery_threshold || 1000}
                    onChange={(e) => setShopConfig({...shopConfig, free_delivery_threshold: parseInt(e.target.value) || 0})}
                    className="mt-1"
                    placeholder="Orders above this amount get free delivery"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders above ₹{shopConfig.free_delivery_threshold || 1000} will get free delivery
                  </p>
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

          {/* Support Contact (shown in app Get Help) */}
          <Card data-testid="support-contact-card">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-lg">Support Contact (Get Help)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Shown to customers in the app's "Get Help" screen (call / WhatsApp / email).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Support Phone</Label>
                  <Input
                    data-testid="support-phone-input"
                    value={supportContact.support_phone}
                    onChange={(e) => setSupportContact({ ...supportContact, support_phone: e.target.value })}
                    className="mt-1"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <Label>WhatsApp Number</Label>
                  <Input
                    data-testid="support-whatsapp-input"
                    value={supportContact.support_whatsapp}
                    onChange={(e) => setSupportContact({ ...supportContact, support_whatsapp: e.target.value })}
                    className="mt-1"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    data-testid="support-email-input"
                    value={supportContact.support_email}
                    onChange={(e) => setSupportContact({ ...supportContact, support_email: e.target.value })}
                    className="mt-1"
                    placeholder="help@store.com"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveSupport}
                disabled={saving}
                data-testid="save-support-btn"
                className="mt-4 bg-primary hover:bg-primary/90 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Support Contact
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

          {/* Referral Program Settings */}
          <Card className="border-2 border-purple-200">
            <CardHeader className="p-4 sm:p-6 pb-2 bg-purple-50/50">
              <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                <Gift className="w-5 h-5" />
                Customer Referral Program
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Configure how the customer referral program works. These settings apply to customers who generate their own referral codes.
              </p>
              
              {/* Program Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="font-medium">Program Status</p>
                  <p className="text-sm text-muted-foreground">Enable or disable the referral program</p>
                </div>
                <Switch
                  checked={referralSettings.is_active}
                  onCheckedChange={(checked) => setReferralSettings(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer Commission Rate (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={referralSettings.customer_commission_rate}
                    onChange={(e) => setReferralSettings(prev => ({ ...prev, customer_commission_rate: parseFloat(e.target.value) || 10 }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission % the referrer earns on each referred order
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">New User Discount (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={referralSettings.referee_discount_percent}
                    onChange={(e) => setReferralSettings(prev => ({ ...prev, referee_discount_percent: parseFloat(e.target.value) || 10 }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Discount % for users who use a referral code
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Max Discount Amount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={referralSettings.max_referee_discount}
                    onChange={(e) => setReferralSettings(prev => ({ ...prev, max_referee_discount: parseFloat(e.target.value) || 100 }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum discount a referred user can get
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Minimum Order Amount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={referralSettings.min_order_amount}
                    onChange={(e) => setReferralSettings(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Min order value for referral code to apply (0 = no minimum)
                  </p>
                </div>
              </div>

              {/* First Order Only Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-4">
                <div>
                  <p className="font-medium">First Order Only</p>
                  <p className="text-sm text-muted-foreground">Referral discount only applies to new customer&apos;s first order</p>
                </div>
                <Switch
                  checked={referralSettings.first_order_only}
                  onCheckedChange={(checked) => setReferralSettings(prev => ({ ...prev, first_order_only: checked }))}
                />
              </div>

              {/* Current Rules Preview */}
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-medium text-purple-800 mb-2">Current Rules:</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Status: <strong>{referralSettings.is_active ? 'Active' : 'Inactive'}</strong></li>
                  <li>• Referrer earns <strong>{referralSettings.customer_commission_rate}%</strong> commission</li>
                  <li>• New user gets <strong>{referralSettings.referee_discount_percent}%</strong> off (max ₹{referralSettings.max_referee_discount})</li>
                  {referralSettings.min_order_amount > 0 && (
                    <li>• Minimum order: <strong>₹{referralSettings.min_order_amount}</strong></li>
                  )}
                  <li>• {referralSettings.first_order_only ? 'First order only' : 'Applies to all orders'}</li>
                </ul>
              </div>

              <Button
                onClick={handleSaveReferralSettings}
                disabled={saving}
                className="mt-4 bg-purple-600 hover:bg-purple-700 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Referral Settings
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Edit the Privacy Policy content. Use markdown formatting (## for headings, ### for subheadings, - for bullet points).
              </p>
              <Textarea
                value={pages['privacy-policy']}
                onChange={(e) => setPages({ ...pages, 'privacy-policy': e.target.value })}
                className="min-h-[300px] font-mono text-sm"
                placeholder="## Privacy Policy&#10;&#10;### 1. Information We Collect&#10;- Your name and contact details&#10;- Order history..."
              />
              <Button
                onClick={() => handleSavePage('privacy-policy')}
                disabled={saving}
                className="mt-4 bg-primary hover:bg-primary/90 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Policy
              </Button>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Edit the Terms of Service content. Use markdown formatting (## for headings, ### for subheadings, - for bullet points).
              </p>
              <Textarea
                value={pages['terms-of-service']}
                onChange={(e) => setPages({ ...pages, 'terms-of-service': e.target.value })}
                className="min-h-[300px] font-mono text-sm"
                placeholder="## Terms of Service&#10;&#10;### 1. Acceptance of Terms&#10;By using our service, you agree to..."
              />
              <Button
                onClick={() => handleSavePage('terms-of-service')}
                disabled={saving}
                className="mt-4 bg-primary hover:bg-primary/90 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Terms of Service
              </Button>
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
    </>
  );
};

export default AdminSettings;
