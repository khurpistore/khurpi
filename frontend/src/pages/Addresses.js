import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Edit2, Trash2, Star, CheckCircle, ArrowLeft, Home, Building2, Navigation, Search, Loader2, Phone, Truck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import SimpleMapPicker from '@/components/SimpleMapPicker';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Shop coordinates (ACE City, Noida Extension)
const SHOP_LOCATION = {
  lat: 28.5672,
  lng: 77.4538
};
const MAX_DELIVERY_DISTANCE_KM = 40;

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Addresses = () => {
  const { user, addresses, addAddress, updateAddressById, deleteAddress, setDefaultAddress, fetchAddresses } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    landmark: '',
    area: '',
    city: 'NOIDA',
    state: 'Uttar Pradesh',
    pincode: '',
    latitude: null,
    longitude: null,
    address_type: 'home',
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [deliveryFees, setDeliveryFees] = useState({});
  const [deliveryEligible, setDeliveryEligible] = useState(true);
  const [distanceFromShop, setDistanceFromShop] = useState(null);
  
  // Check if coming from checkout or subscription flow
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo');
  const fromCheckout = localStorage.getItem('checkoutReturn') === 'true' || location.state?.from === 'checkout';

  // Calculate delivery fees for all addresses
  useEffect(() => {
    const calculateFees = async () => {
      const fees = {};
      for (const address of addresses) {
        if (address.latitude && address.longitude) {
          try {
            const response = await axios.post(
              `${API}/settings/calculate-delivery-fee?lat=${address.latitude}&lon=${address.longitude}`
            );
            fees[address.id] = response.data;
          } catch (error) {
            fees[address.id] = { fee: 0, label: 'Unable to calculate' };
          }
        }
      }
      setDeliveryFees(fees);
    };
    
    if (addresses.length > 0) {
      calculateFees();
    }
  }, [addresses]);

  // Handle return navigation
  const handleBack = () => {
    if (returnTo === 'subscription') {
      navigate('/subscription/create?restored=true');
    } else if (fromCheckout) {
      localStorage.removeItem('checkoutReturn');
      navigate('/checkout');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user, navigate]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      landmark: '',
      area: '',
      city: 'NOIDA',
      state: 'Uttar Pradesh',
      pincode: '',
      latitude: null,
      longitude: null,
      address_type: 'home',
      is_default: false
    });
    setEditingAddress(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchedLocation(null);
    setDeliveryEligible(true);
    setDistanceFromShop(null);
  };

  const handleLocationSelect = (location) => {
    const distance = calculateDistance(
      SHOP_LOCATION.lat, SHOP_LOCATION.lng,
      location.lat, location.lng
    );
    
    setDistanceFromShop(distance);
    setDeliveryEligible(distance <= MAX_DELIVERY_DISTANCE_KM);
    
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  // Debounced search for addresses
  const searchAddress = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Using OpenStreetMap Nominatim API for address search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Address search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress]);

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Calculate distance from shop
    const distance = calculateDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, lat, lng);
    setDistanceFromShop(distance);
    setDeliveryEligible(distance <= MAX_DELIVERY_DISTANCE_KM);
    
    // Parse address components
    const displayName = result.display_name || '';
    const parts = displayName.split(',').map(p => p.trim());
    
    // Try to extract city and pincode
    let city = '';
    let pincode = '';
    let area = '';
    let address_line_1 = '';
    let address_line_2 = '';
    
    // Look for Noida or other city names and extract details
    parts.forEach((part, index) => {
      const lowerPart = part.toLowerCase();
      
      // City detection
      if (lowerPart.includes('noida')) city = 'NOIDA';
      else if (lowerPart.includes('delhi')) city = 'Delhi';
      else if (lowerPart.includes('gurgaon') || lowerPart.includes('gurugram')) city = 'Gurugram';
      else if (lowerPart.includes('ghaziabad')) city = 'Ghaziabad';
      else if (lowerPart.includes('greater noida')) city = 'Greater Noida';
      
      // Check for pincode (6 digits)
      const pincodeMatch = part.match(/\d{6}/);
      if (pincodeMatch) pincode = pincodeMatch[0];
      
      // Check for sector/area
      if (lowerPart.includes('sector') || lowerPart.includes('block') || lowerPart.includes('phase')) {
        area = part;
      }
    });

    // Build address lines from parts
    // First part is usually the specific location/building
    if (parts.length > 0) {
      address_line_1 = parts[0];
    }
    
    // Second and third parts are usually street/area details
    if (parts.length > 1) {
      const middleParts = parts.slice(1, Math.min(4, parts.length - 3)).filter(p => {
        const lower = p.toLowerCase();
        return !lower.includes('india') && 
               !lower.includes('uttar pradesh') && 
               !lower.match(/^\d{6}$/) &&
               !lower.includes('district');
      });
      address_line_2 = middleParts.join(', ');
    }

    // If no area found from sector detection, use a middle part
    if (!area && parts.length > 2) {
      area = parts[1] || '';
    }

    // If no city found, try to find from parts
    if (!city && parts.length > 3) {
      city = parts[parts.length - 3] || '';
    }

    setFormData(prev => ({
      ...prev,
      address_line_1: address_line_1,
      address_line_2: address_line_2,
      area: area,
      city: city,
      pincode: pincode,
      latitude: lat,
      longitude: lng
    }));

    // Show selected address in search box
    setSearchQuery(displayName);
    
    // Set searched location to update map marker
    setSearchedLocation({ lat, lng });

    // Clear dropdown results
    setSearchResults([]);
  };

  const buildAddressLine = () => {
    const parts = [
      formData.address_line_1,
      formData.address_line_2,
      formData.landmark,
      formData.area,
      formData.city,
      formData.state,
      formData.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate map location is set
    if (!formData.latitude || !formData.longitude) {
      toast.error('Location Required', {
        description: 'Please pin your delivery location on the map or search for an address.'
      });
      return;
    }

    // Check delivery eligibility
    if (!deliveryEligible) {
      toast.error('Delivery Not Available', {
        description: `We currently deliver within ${MAX_DELIVERY_DISTANCE_KM}km of our store. Your location is ${distanceFromShop?.toFixed(1)}km away.`
      });
      return;
    }

    // Validate receiver name
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Receiver Name Required', {
        description: 'Please enter the receiver\'s name.'
      });
      return;
    }

    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Phone Number Required', {
        description: 'Please enter a valid 10-digit phone number.'
      });
      return;
    }
    
    const fullAddress = buildAddressLine();

    if (!formData.pincode || formData.pincode.length !== 6) {
      toast.error('Invalid PIN Code', {
        description: 'Please enter a valid 6-digit PIN code.'
      });
      return;
    }

    setLoading(true);
    try {
      const addressData = {
        address_line: fullAddress,
        name: formData.name,
        phone: formData.phone,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2,
        landmark: formData.landmark,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address_type: formData.address_type,
        is_default: formData.is_default
      };

      if (editingAddress) {
        await updateAddressById(editingAddress.id, addressData);
        toast.success('Address Updated', {
          description: `${formData.name || 'Address'} has been saved.`
        });
      } else {
        await addAddress(addressData);
        toast.success('Address Added', {
          description: 'Your address has been saved successfully.'
        });
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to Save', {
        description: error.response?.data?.detail || 'Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    
    // Parse address fields
    let name = address.name || '';
    let phone = address.phone || '';
    let address_line_1 = address.address_line_1 || '';
    let address_line_2 = address.address_line_2 || '';
    let landmark = address.landmark || '';
    let area = address.area || '';
    let city = address.city || 'NOIDA';
    let state = address.state || 'Uttar Pradesh';
    let pincode = address.pincode || '';
    let address_type = address.address_type || 'home';
    
    // If individual fields are not stored, try to parse from address_line
    if (!address_line_1 && address.address_line) {
      const parts = address.address_line.split(',').map(p => p.trim());
      if (parts.length >= 1) address_line_1 = parts[0];
      if (parts.length >= 2) address_line_2 = parts.slice(1, -2).join(', ');
      const pincodeMatch = address.address_line.match(/\d{6}/);
      if (pincodeMatch) pincode = pincodeMatch[0];
      const areaMatch = address.address_line.match(/Sector\s*\d+/i);
      if (areaMatch) area = areaMatch[0];
    }
    
    setFormData({
      name: name,
      phone: phone,
      address_line_1: address_line_1,
      address_line_2: address_line_2,
      landmark: landmark,
      area: area,
      city: city,
      state: state,
      pincode: pincode,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      address_type: address_type,
      is_default: address.is_default || false
    });
    
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteAddress(addressId);
      toast.success('Address Deleted', {
        description: 'The address has been removed.'
      });
    } catch (error) {
      toast.error('Delete Failed', {
        description: 'Could not delete address. Please try again.'
      });
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      toast.success('Default Address Set', {
        description: 'This address will be used for deliveries.'
      });
    } catch (error) {
      toast.error('Update Failed', {
        description: 'Could not set default address.'
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Banner - Only show when from checkout */}
        {(returnTo === 'subscription' || fromCheckout) && (
          <div className="mb-4 flex items-center justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="rounded-full text-primary border-primary hover:bg-primary hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {returnTo === 'subscription' ? 'Back to Subscription' : 'Back to Checkout'}
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <MapPin className="w-7 h-7" />
            My Addresses
          </h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                {/* Address Search */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                    <Search className="w-4 h-4" />
                    Search Address
                  </div>
                  <div className="relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type to search for your address..."
                      className="bg-white pr-10"
                      data-testid="address-search-input"
                    />
                    {searchLoading && (
                      <Loader2 className="w-4 h-4 absolute right-3 top-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSearchSelect(result)}
                        >
                          <p className="text-sm">{result.display_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-blue-600 mt-2">
                    Search for your address or pin it on the map below
                  </p>
                </div>

                {/* Map Location */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Navigation className="w-4 h-4" />
                      Pin Location *
                    </div>
                    {formData.latitude && formData.longitude ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Location Set
                      </span>
                    ) : (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                  <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
                    <SimpleMapPicker
                      key={editingAddress?.id || 'new'}
                      onLocationSelect={handleLocationSelect}
                      initialLocation={formData.latitude && formData.longitude ? {
                        lat: formData.latitude,
                        lng: formData.longitude
                      } : null}
                      externalLocation={searchedLocation}
                    />
                  </div>
                  {!formData.latitude && !formData.longitude && (
                    <p className="text-xs text-red-500 mt-2">Click on the map to pin your delivery location</p>
                  )}
                  
                  {/* Delivery Eligibility Warning */}
                  {formData.latitude && formData.longitude && !deliveryEligible && (
                    <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-800">Delivery Not Available</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Sorry, we currently deliver only within <span className="font-bold">{MAX_DELIVERY_DISTANCE_KM}km</span> of our store in Noida Extension.
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            Your selected location is <span className="font-bold">{distanceFromShop?.toFixed(1)}km</span> away.
                          </p>
                          <p className="text-xs text-red-500 mt-2">
                            💡 Please select a different address within our delivery zone.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivery Distance Info (when eligible) */}
                  {formData.latitude && formData.longitude && deliveryEligible && distanceFromShop && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          ✓ Delivery available! Your location is <span className="font-semibold">{distanceFromShop.toFixed(1)}km</span> from our store.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Type Selection */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4" />
                    Address Type *
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'home', label: 'Home', icon: Home },
                      { value: 'office', label: 'Office', icon: Building2 },
                      { value: 'other', label: 'Other', icon: MapPin }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, address_type: value }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                          formData.address_type === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receiver Details */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Home className="w-4 h-4" />
                    Receiver Details *
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Receiver Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., John Doe"
                        required
                        className="mt-1 bg-white"
                        data-testid="address-name-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone Number *</Label>
                      <div className="flex mt-1">
                        <div className="flex items-center px-2 bg-gray-100 border border-r-0 rounded-l-lg text-xs text-muted-foreground">
                          +91
                        </div>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          placeholder="10-digit number"
                          required
                          maxLength={10}
                          className="bg-white rounded-l-none"
                          data-testid="address-phone-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="w-4 h-4" />
                    Address Details
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">House/Flat No., Building Name *</Label>
                    <Input
                      value={formData.address_line_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line_1: e.target.value }))}
                      placeholder="e.g., B-42, Sunrise Apartments"
                      required
                      className="mt-1 bg-white"
                      data-testid="address-line1-input"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Street / Road</Label>
                    <Input
                      value={formData.address_line_2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line_2: e.target.value }))}
                      placeholder="e.g., Main Road, Block A"
                      className="mt-1 bg-white"
                      data-testid="address-line2-input"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Landmark (for easy delivery)</Label>
                    <Input
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="e.g., Near City Mall, Opposite Metro Station"
                      className="mt-1 bg-white"
                      data-testid="address-landmark-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Area / Sector *</Label>
                      <Input
                        value={formData.area}
                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        placeholder="e.g., Sector 62"
                        required
                        className="mt-1 bg-white"
                        data-testid="address-area-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g., Noida"
                        required
                        className="mt-1 bg-white"
                        data-testid="address-city-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">State *</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="e.g., Uttar Pradesh"
                        required
                        className="mt-1 bg-white"
                        data-testid="address-state-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">PIN Code *</Label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        placeholder="e.g., 201301"
                        required
                        maxLength={6}
                        className="mt-1 bg-white"
                        data-testid="address-pincode-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Default Address Toggle */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.is_default 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, is_default: !prev.is_default }))}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.is_default ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {formData.is_default && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Set as default address</p>
                      <p className="text-xs text-muted-foreground">This will be your primary delivery address</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 rounded-full"
                    data-testid="cancel-address-btn"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 rounded-full"
                    data-testid="save-address-btn"
                  >
                    {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Addresses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your delivery address to start ordering
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...addresses]
              .sort((a, b) => {
                // Default address first, then sort by updated_at or created_at (most recent first)
                if (a.is_default && !b.is_default) return -1;
                if (!a.is_default && b.is_default) return 1;
                // Sort by updated_at or created_at descending (most recent first)
                const dateA = new Date(a.updated_at || a.created_at || 0);
                const dateB = new Date(b.updated_at || b.created_at || 0);
                return dateB - dateA;
              })
              .map((address) => {
                // Get address type icon
                const AddressTypeIcon = address.address_type === 'office' ? Building2 : address.address_type === 'other' ? MapPin : Home;
                const addressTypeLabel = address.address_type === 'office' ? 'Office' : address.address_type === 'other' ? 'Other' : 'Home';
                
                return (
                  <Card 
                    key={address.id} 
                    data-testid={`address-card-${address.id}`}
                    className={`transition-all cursor-pointer hover:shadow-md ${address.is_default ? 'border-primary border-2 bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => !address.is_default && handleSetDefault(address.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Address Type & Default Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              address.is_default ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <AddressTypeIcon className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-medium text-muted-foreground uppercase">{addressTypeLabel}</span>
                              {address.is_default && (
                                <Badge className="bg-primary text-white text-xs px-1.5 py-0">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Receiver Name */}
                          <p className="font-semibold text-sm mb-0.5">{address.name || 'Receiver'}</p>
                          
                          {/* Phone */}
                          {address.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Phone className="w-3 h-3" />
                              +91 {address.phone}
                            </p>
                          )}
                          
                          {/* Address */}
                          <p className="text-xs text-gray-600 line-clamp-2">{address.address_line}</p>
                          
                          {/* Landmark if available */}
                          {address.landmark && (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">
                              Near: {address.landmark}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(address)}
                            className="h-7 w-7 p-0"
                            data-testid={`edit-address-${address.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(address.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`delete-address-${address.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
