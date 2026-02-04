import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Phone, MessageCircle, Store, User, MapPin, Package, Plus, Minus, 
  Search, Loader2, CheckCircle, ShoppingBag, Tag, CreditCard, Trash2,
  ChevronRight, AlertCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminCreateOrder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Customer, 2: Products, 3: Review
  const [loading, setLoading] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  
  // Customer state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address_line: '',
    area: '',
    city: 'NOIDA',
    pincode: ''
  });
  
  // Products state
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  
  // Order state
  const [orderSource, setOrderSource] = useState('phone');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [couponCode, setCouponCode] = useState('');
  const [applyAutoDiscount, setApplyAutoDiscount] = useState(true);
  
  // Calculated values
  const [subtotal, setSubtotal] = useState(0);
  const [discountTiers, setDiscountTiers] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchDiscountTiers();
  }, []);

  useEffect(() => {
    // Calculate subtotal when products change
    const total = selectedProducts.reduce((sum, item) => {
      return sum + (item.quantity / 100) * item.product.price;
    }, 0);
    setSubtotal(total);
  }, [selectedProducts]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data.filter(p => p.stock_status !== 'out_of_stock'));
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchDiscountTiers = async () => {
    try {
      const response = await axios.get(`${API}/admin/discount-tiers`);
      setDiscountTiers(response.data.filter(t => t.is_active));
    } catch (error) {
      console.error('Failed to load discount tiers');
    }
  };

  const searchCustomer = async () => {
    if (customerPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setSearchingCustomer(true);
    try {
      const response = await axios.get(`${API}/admin/users`);
      const foundCustomer = response.data.find(u => u.phone === customerPhone);
      
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setIsNewCustomer(false);
        toast.success(`Found customer: ${foundCustomer.name}`);
        
        // Fetch customer addresses
        const addressRes = await axios.get(`${API}/users/${foundCustomer.id}/addresses`);
        setAddresses(addressRes.data || []);
        if (addressRes.data?.length > 0) {
          const defaultAddr = addressRes.data.find(a => a.is_default) || addressRes.data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } else {
        setCustomer(null);
        setIsNewCustomer(true);
        setAddresses([]);
        toast.info('Customer not found. You can create a new customer.');
      }
    } catch (error) {
      toast.error('Failed to search customer');
    } finally {
      setSearchingCustomer(false);
    }
  };

  const addProduct = (product) => {
    const existing = selectedProducts.find(p => p.product.id === product.id);
    if (existing) {
      setSelectedProducts(prev => prev.map(p => 
        p.product.id === product.id 
          ? { ...p, quantity: p.quantity + 100 }
          : p
      ));
    } else {
      setSelectedProducts(prev => [...prev, { product, quantity: 100 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.product.id === productId) {
        const newQty = Math.max(100, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product.id !== productId));
  };

  const getApplicableDiscount = () => {
    if (!applyAutoDiscount) return null;
    const sortedTiers = [...discountTiers].sort((a, b) => b.min_order_value - a.min_order_value);
    return sortedTiers.find(tier => subtotal >= tier.min_order_value);
  };

  const calculateTotal = () => {
    let discount = 0;
    const tier = getApplicableDiscount();
    if (tier) {
      discount = (subtotal * tier.discount_percent) / 100;
    }
    return Math.max(0, subtotal - discount);
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        customer_phone: customerPhone,
        customer_name: isNewCustomer ? newCustomerName : undefined,
        customer_email: isNewCustomer ? newCustomerEmail : undefined,
        address_id: selectedAddressId || undefined,
        new_address: showNewAddressForm ? {
          ...newAddress,
          phone: newAddress.phone || customerPhone
        } : undefined,
        items: selectedProducts.map(p => ({
          product_id: p.product.id,
          quantity: p.quantity
        })),
        order_source: orderSource,
        order_notes: orderNotes || undefined,
        payment_status: paymentStatus,
        apply_auto_discount: applyAutoDiscount,
        coupon_code: couponCode || undefined
      };

      const response = await axios.post(`${API}/admin/orders/create`, orderData);
      toast.success('Order created successfully!');
      navigate('/admin/orders');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = () => {
    if (isNewCustomer) {
      return customerPhone.length === 10 && newCustomerName.trim().length > 0;
    }
    return customer !== null;
  };

  const canProceedToStep3 = () => {
    return selectedProducts.length > 0 && (selectedAddressId || showNewAddressForm);
  };

  const getOrderSourceIcon = (source) => {
    switch (source) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'walk_in': return <Store className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <AdminLayout active="create-order" title="Create Order">
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 rounded ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center gap-8 mt-2 text-sm text-muted-foreground">
          <span className={step === 1 ? 'text-primary font-medium' : ''}>Customer</span>
          <span className={step === 2 ? 'text-primary font-medium' : ''}>Products</span>
          <span className={step === 3 ? 'text-primary font-medium' : ''}>Review</span>
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Order Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'phone', label: 'Phone Call', icon: Phone, color: 'bg-blue-100 text-blue-700 border-blue-300' },
                  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-100 text-green-700 border-green-300' },
                  { value: 'walk_in', label: 'Walk-in', icon: Store, color: 'bg-orange-100 text-orange-700 border-orange-300' }
                ].map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setOrderSource(value)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      orderSource === value 
                        ? color + ' border-current' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phone Number</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit phone number"
                      className="pl-10"
                      onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
                    />
                  </div>
                  <Button onClick={searchCustomer} disabled={searchingCustomer}>
                    {searchingCustomer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Existing Customer Found */}
              {customer && !isNewCustomer && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">{customer.name}</p>
                      <p className="text-sm text-green-600">{customer.phone}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                </div>
              )}

              {/* New Customer Form */}
              {isNewCustomer && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">New Customer</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Customer Name *</Label>
                      <Input
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="Enter name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email (Optional)</Label>
                      <Input
                        value={newCustomerEmail}
                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                        placeholder="Enter email"
                        className="mt-1"
                        type="email"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Selection */}
              {(customer || isNewCustomer) && (
                <div className="space-y-3">
                  <Label>Delivery Address</Label>
                  
                  {addresses.length > 0 && (
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => { setSelectedAddressId(addr.id); setShowNewAddressForm(false); }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id && !showNewAddressForm
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{addr.name || 'Address'}</p>
                              <p className="text-xs text-muted-foreground">{addr.address_line}</p>
                              {addr.phone && <p className="text-xs text-muted-foreground">📞 {addr.phone}</p>}
                            </div>
                            {addr.is_default && (
                              <Badge className="bg-primary/10 text-primary text-xs">Default</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setShowNewAddressForm(!showNewAddressForm); setSelectedAddressId(''); }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>

                  {showNewAddressForm && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Receiver Name</Label>
                          <Input
                            value={newAddress.name}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Phone</Label>
                          <Input
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            placeholder="Phone number"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Full Address *</Label>
                        <Input
                          value={newAddress.address_line}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address_line: e.target.value }))}
                          placeholder="House no, Street, Area"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Area/Sector</Label>
                          <Input
                            value={newAddress.area}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, area: e.target.value }))}
                            placeholder="Sector 62"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">City</Label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">PIN Code</Label>
                          <Input
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                            placeholder="201301"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(2)} 
              disabled={!canProceedToStep2()}
              className="rounded-full"
            >
              Next: Select Products
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Product Selection */}
      {step === 2 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Available Products
                </CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addProduct(product)}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">₹{product.price}/100gm</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Order Items ({selectedProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No products added yet</p>
                    <p className="text-sm">Click products on the left to add them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map((item) => {
                      const itemTotal = (item.quantity / 100) * item.product.price;
                      return (
                        <div key={item.product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">₹{item.product.price}/100gm</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => updateQuantity(item.product.id, -100)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-16 text-center text-sm font-medium">{item.quantity}gm</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => updateQuantity(item.product.id, 100)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right w-16">
                            <p className="font-bold text-primary">₹{itemTotal.toFixed(0)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeProduct(item.product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                      </div>
                      {getApplicableDiscount() && (
                        <div className="flex justify-between text-sm text-green-600 mt-1">
                          <span>Discount ({getApplicableDiscount().discount_percent}%)</span>
                          <span>-₹{((subtotal * getApplicableDiscount().discount_percent) / 100).toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span className="text-primary">₹{calculateTotal().toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)} 
              disabled={!canProceedToStep3()}
              className="rounded-full"
            >
              Next: Review Order
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{isNewCustomer ? newCustomerName : customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{customerPhone}</p>
                  </div>
                  <Badge className={`ml-auto ${
                    orderSource === 'phone' ? 'bg-blue-100 text-blue-700' :
                    orderSource === 'whatsapp' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {getOrderSourceIcon(orderSource)}
                    <span className="ml-1 capitalize">{orderSource.replace('_', '-')}</span>
                  </Badge>
                </div>
              </div>

              {/* Address */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Delivery Address</p>
                    {showNewAddressForm ? (
                      <p className="text-sm text-muted-foreground">
                        {newAddress.address_line}, {newAddress.area}, {newAddress.city} - {newAddress.pincode}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {addresses.find(a => a.id === selectedAddressId)?.address_line}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-2">
                {selectedProducts.map((item) => {
                  const itemTotal = (item.quantity / 100) * item.product.price;
                  return (
                    <div key={item.product.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}gm × ₹{item.product.price}/100gm</p>
                      </div>
                      <p className="font-bold text-primary">₹{itemTotal.toFixed(0)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                {getApplicableDiscount() && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Discount ({getApplicableDiscount().discount_percent}%)
                    </span>
                    <span>-₹{((subtotal * getApplicableDiscount().discount_percent) / 100).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{calculateTotal().toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">COD - Payment Pending</SelectItem>
                    <SelectItem value="paid">Already Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Coupon Code (Optional)</Label>
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Order Notes (Optional)</Label>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions or notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="rounded-full">
              Back
            </Button>
            <Button 
              onClick={createOrder} 
              disabled={loading}
              className="rounded-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Order (₹{calculateTotal().toFixed(0)})
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCreateOrder;
