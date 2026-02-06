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
import { MapPin, Plus, Edit2, Trash2, CheckCircle, ArrowLeft, Home, Building2, Navigation, Search, Loader2, Phone, Locate, X } from 'lucide-react';
import { toast } from 'sonner';
import SimpleMapPicker from '@/components/SimpleMapPicker';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    city: '',
    state: '',
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
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hasSelectedResult, setHasSelectedResult] = useState(false);
  
  // Check if coming from checkout or subscription flow
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo');
  const fromCheckout = localStorage.getItem('checkoutReturn') === 'true' || location.state?.from === 'checkout';

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
      city: '',
      state: '',
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
    setShowSearchResults(false);
    setHasSelectedResult(false);
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
    
    // Reverse geocode to get address
    reverseGeocode(location.lat, location.lng);
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        setFormData(prev => ({
          ...prev,
          address_line_1: [addr.house_number, addr.road].filter(Boolean).join(' ') || addr.neighbourhood || '',
          area: addr.suburb || addr.neighbourhood || addr.village || '',
          city: addr.city || addr.town || addr.county || addr.state_district || '',
          state: addr.state || '',
          pincode: addr.postcode || ''
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        
        setSearchedLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocode
        await reverseGeocode(latitude, longitude);
        
        setGettingLocation(false);
        toast.success('Location detected!');
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Please allow location access in your browser');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('Unable to get your location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Improved address search with better query handling
  const searchAddress = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Clean up the query - remove extra spaces, special chars
      let cleanQuery = query.trim().replace(/\s+/g, ' ');
      
      // Add India to search if not present
      if (!cleanQuery.toLowerCase().includes('india')) {
        cleanQuery = `${cleanQuery}, India`;
      }

      // Try primary search
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=8&addressdetails=1`
      );
      let data = await response.json();

      // If no results, try with partial matching
      if (data.length === 0 && query.length >= 3) {
        // Try searching with just key parts
        const keywords = query.split(/[\s,]+/).filter(w => w.length > 2);
        if (keywords.length > 0) {
          const simpleQuery = keywords.slice(0, 3).join(' ') + ', India';
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simpleQuery)}&limit=8&addressdetails=1`
          );
          data = await response.json();
        }
      }

      // If still no results, try postal code search
      if (data.length === 0) {
        const pincodeMatch = query.match(/\d{6}/);
        if (pincodeMatch) {
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincodeMatch[0]}&country=India&limit=5`
          );
          data = await response.json();
        }
      }

      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Address search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't search if user just selected a result
      if (hasSelectedResult) {
        return;
      }
      if (searchQuery && searchQuery.length >= 2) {
        searchAddress(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress, hasSelectedResult]);

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const addr = result.address || {};
    
    // Parse address components
    let city = addr.city || addr.town || addr.county || addr.state_district || '';
    let state = addr.state || '';
    let pincode = addr.postcode || '';
    let area = addr.suburb || addr.neighbourhood || addr.village || '';
    let address_line_1 = '';
    let address_line_2 = '';
    
    // Build address line from parts
    const displayParts = result.display_name.split(',').map(p => p.trim());
    if (displayParts.length > 0) {
      address_line_1 = displayParts[0];
    }
    if (displayParts.length > 1) {
      // Filter out city, state, country, pincode from middle parts
      const middleParts = displayParts.slice(1, -3).filter(p => {
        const lower = p.toLowerCase();
        return !lower.includes('india') && 
               !lower.match(/^\d{6}$/) &&
               lower !== city.toLowerCase() &&
               lower !== state.toLowerCase();
      });
      address_line_2 = middleParts.slice(0, 2).join(', ');
    }

    setFormData(prev => ({
      ...prev,
      address_line_1,
      address_line_2,
      area: area || address_line_2.split(',')[0] || '',
      city,
      state,
      pincode,
      latitude: lat,
      longitude: lng
    }));

    setSearchQuery(result.display_name);
    setSearchedLocation({ lat, lng });
    setSearchResults([]);
    setShowSearchResults(false);
    setHasSelectedResult(true);  // Prevent re-searching
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
    
    // Validate receiver name
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Please enter receiver\'s name');
      return;
    }

    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate address
    if (!formData.address_line_1) {
      toast.error('Please enter house/flat number or building name');
      return;
    }

    if (!formData.city) {
      toast.error('Please enter city name');
      return;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }
    
    const fullAddress = buildAddressLine();

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
        toast.success('Address updated successfully!');
      } else {
        await addAddress(addressData);
        toast.success('Address added successfully!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save address');
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
    let city = address.city || '';
    let state = address.state || '';
    let pincode = address.pincode || '';
    let address_type = address.address_type || 'home';
    
    // If individual fields are not stored, try to parse from address_line
    if (!address_line_1 && address.address_line) {
      const parts = address.address_line.split(',').map(p => p.trim());
      if (parts.length >= 1) address_line_1 = parts[0];
      if (parts.length >= 2) address_line_2 = parts.slice(1, -2).join(', ');
      const pincodeMatch = address.address_line.match(/\d{6}/);
      if (pincodeMatch) pincode = pincodeMatch[0];
    }
    
    setFormData({
      name,
      phone,
      address_line_1,
      address_line_2,
      landmark,
      area,
      city,
      state,
      pincode,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      address_type,
      is_default: address.is_default || false
    });
    
    // Set map location if available
    if (address.latitude && address.longitude) {
      setSearchedLocation({ lat: address.latitude, lng: address.longitude });
    }
    
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteAddress(addressId);
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Banner */}
        {(returnTo === 'subscription' || fromCheckout) && (
          <div className="mb-4">
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
              <Button className="rounded-full" data-testid="add-address-btn">
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
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                
                {/* Step 1: Find Location */}
                <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                      <span className="font-medium text-blue-900">Find Your Location</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="text-xs h-8 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {gettingLocation ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Locate className="w-3 h-3 mr-1" />
                      )}
                      Use My Location
                    </Button>
                  </div>
                  
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(true);
                        setHasSelectedResult(false);  // Reset when user types
                      }}
                      onFocus={() => !hasSelectedResult && searchResults.length > 0 && setShowSearchResults(true)}
                      placeholder="Search: building name, area, city, pincode..."
                      className="pl-9 pr-9 bg-white"
                      data-testid="address-search-input"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                          setHasSelectedResult(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {searchLoading && (
                      <Loader2 className="w-4 h-4 absolute right-9 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />
                    )}
                  </div>
                  
                  {/* Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                          onClick={() => handleSearchSelect(result)}
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 leading-snug">{result.display_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showSearchResults && searchQuery.length >= 3 && !searchLoading && searchResults.length === 0 && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                      No results found. Try a different search or pin location on map below.
                    </p>
                  )}
                  
                  <p className="text-xs text-blue-600">
                    Tip: Search with area name, landmark, or pincode for better results
                  </p>
                </div>

                {/* Map */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Pin on Map</span>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Location Set
                      </Badge>
                    )}
                  </div>
                  <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
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
                  <p className="text-xs text-gray-500">Click on map to adjust pin location</p>
                </div>

                {/* Step 2: Address Type */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span className="font-medium">Address Type</span>
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
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Receiver Details */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
                    <span className="font-medium">Receiver Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Receiver's name"
                        className="mt-1 bg-white"
                        data-testid="address-name-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Phone *</Label>
                      <div className="flex mt-1">
                        <span className="flex items-center px-2 bg-gray-100 border border-r-0 rounded-l-md text-xs text-gray-500">
                          +91
                        </span>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          placeholder="10-digit number"
                          maxLength={10}
                          className="bg-white rounded-l-none"
                          data-testid="address-phone-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Address Details */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">4</div>
                    <span className="font-medium">Address Details</span>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">House/Flat No., Building *</Label>
                    <Input
                      value={formData.address_line_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line_1: e.target.value }))}
                      placeholder="e.g., B-42, Sunrise Apartments"
                      className="mt-1 bg-white"
                      data-testid="address-line1-input"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Street / Road</Label>
                    <Input
                      value={formData.address_line_2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line_2: e.target.value }))}
                      placeholder="e.g., Main Road"
                      className="mt-1 bg-white"
                      data-testid="address-line2-input"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Landmark</Label>
                    <Input
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="e.g., Near City Mall"
                      className="mt-1 bg-white"
                      data-testid="address-landmark-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Area / Sector</Label>
                      <Input
                        value={formData.area}
                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        placeholder="e.g., Sector 62"
                        className="mt-1 bg-white"
                        data-testid="address-area-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g., Delhi"
                        className="mt-1 bg-white"
                        data-testid="address-city-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="e.g., Delhi"
                        className="mt-1 bg-white"
                        data-testid="address-state-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">PIN Code *</Label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        placeholder="e.g., 110001"
                        maxLength={6}
                        className="mt-1 bg-white"
                        data-testid="address-pincode-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Default Address Toggle */}
                <div 
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.is_default 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
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
                      <p className="text-xs text-muted-foreground">Primary delivery address</p>
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
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingAddress ? 'Update Address' : 'Save Address'}
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
                if (a.is_default && !b.is_default) return -1;
                if (!a.is_default && b.is_default) return 1;
                const dateA = new Date(a.updated_at || a.created_at || 0);
                const dateB = new Date(b.updated_at || b.created_at || 0);
                return dateB - dateA;
              })
              .map((address) => {
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
                          
                          <p className="font-semibold text-sm mb-0.5">{address.name || 'Receiver'}</p>
                          
                          {address.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Phone className="w-3 h-3" />
                              +91 {address.phone}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-600 line-clamp-2">{address.address_line}</p>
                          
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
