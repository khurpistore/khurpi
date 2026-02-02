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
import { MapPin, Plus, Edit2, Trash2, Star, CheckCircle, ArrowLeft, Home, Building2, Navigation, Search, Loader2, Phone, Truck } from 'lucide-react';
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
    area: '',
    city: '',
    pincode: '',
    latitude: null,
    longitude: null,
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [deliveryFees, setDeliveryFees] = useState({});
  
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
      area: '',
      city: '',
      pincode: '',
      latitude: null,
      longitude: null,
      is_default: false
    });
    setEditingAddress(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchedLocation(null);
  };

  const handleLocationSelect = (location) => {
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
      formData.area,
      formData.city,
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
        area: formData.area,
        city: formData.city,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude,
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
    let area = address.area || '';
    let city = address.city || '';
    let pincode = address.pincode || '';
    
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
      area: area,
      city: city || 'NOIDA',
      pincode: pincode,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
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
                </div>

                {/* Address Label */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Home className="w-4 h-4" />
                    Address Label *
                  </div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Home, Office, Mom's Place"
                    required
                    className="bg-white"
                    data-testid="address-name-input"
                  />
                </div>

                {/* Phone Number */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </div>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-sm text-muted-foreground">
                      +91
                    </div>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="10-digit mobile number"
                      required
                      maxLength={10}
                      className="bg-white rounded-l-none"
                      data-testid="address-phone-input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">This number will be used for delivery updates</p>
                </div>

                {/* Address Details */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
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
                    <Label className="text-xs text-muted-foreground">Street, Landmark (optional)</Label>
                    <Input
                      value={formData.address_line_2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line_2: e.target.value }))}
                      placeholder="e.g., Near City Mall, Main Road"
                      className="mt-1 bg-white"
                      data-testid="address-line2-input"
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
                // Default address first, then sort by created_at (most recent first)
                if (a.is_default && !b.is_default) return -1;
                if (!a.is_default && b.is_default) return 1;
                // Sort by created_at descending (most recent first)
                const dateA = new Date(a.created_at || 0);
                const dateB = new Date(b.created_at || 0);
                return dateB - dateA;
              })
              .map((address) => {
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
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            address.is_default ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <MapPin className="w-3 h-3" />
                          </div>
                          <span className="font-medium text-sm truncate">{address.name || 'Address'}</span>
                          {address.is_default && (
                            <Badge className="bg-primary text-white text-xs px-1.5 py-0">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 ml-8 line-clamp-2">{address.address_line}</p>
                        {address.phone && (
                          <p className="text-xs text-muted-foreground ml-8 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            +91 {address.phone}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
