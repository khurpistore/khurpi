import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Edit2, Trash2, Star, CheckCircle, ArrowLeft, Home, Building2, Navigation, Search, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import SimpleMapPicker from '@/components/SimpleMapPicker';

const NOIDA_BOUNDS = {
  minLat: 28.45,
  maxLat: 28.65,
  minLng: 77.25,
  maxLng: 77.55
};

const Addresses = () => {
  const { user, addresses, addAddress, updateAddressById, deleteAddress, setDefaultAddress, fetchAddresses } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
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
  const [isNoidaLocation, setIsNoidaLocation] = useState(true);
  
  // Check if coming from checkout or subscription flow
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo');
  const fromCheckout = localStorage.getItem('checkoutReturn') === 'true';

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
    setIsNoidaLocation(true);
  };

  // Check if location is in Noida
  const checkNoidaLocation = (lat, lng) => {
    const isNoida = lat >= NOIDA_BOUNDS.minLat && lat <= NOIDA_BOUNDS.maxLat &&
                    lng >= NOIDA_BOUNDS.minLng && lng <= NOIDA_BOUNDS.maxLng;
    setIsNoidaLocation(isNoida);
    return isNoida;
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
    checkNoidaLocation(location.lat, location.lng);
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
    
    // Look for Noida or other city names
    parts.forEach(part => {
      if (part.toLowerCase().includes('noida')) city = 'NOIDA';
      else if (part.toLowerCase().includes('delhi')) city = 'Delhi';
      else if (part.toLowerCase().includes('gurgaon') || part.toLowerCase().includes('gurugram')) city = 'Gurugram';
      else if (part.toLowerCase().includes('ghaziabad')) city = 'Ghaziabad';
      
      // Check for pincode (6 digits)
      const pincodeMatch = part.match(/\d{6}/);
      if (pincodeMatch) pincode = pincodeMatch[0];
      
      // Check for sector
      if (part.toLowerCase().includes('sector')) area = part;
    });

    setFormData(prev => ({
      ...prev,
      address_line_1: parts[0] || '',
      address_line_2: parts.slice(1, 3).join(', ') || '',
      area: area || parts[1] || '',
      city: city || parts[parts.length - 3] || '',
      pincode: pincode,
      latitude: lat,
      longitude: lng
    }));

    checkNoidaLocation(lat, lng);
    setSearchQuery('');
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
          description: isNoidaLocation 
            ? 'Your address is ready for delivery!' 
            : 'Address saved. Note: Delivery is only available in Noida.'
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
      address_line_1: address_line_1,
      address_line_2: address_line_2,
      area: area,
      city: city || 'NOIDA',
      pincode: pincode,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      is_default: address.is_default || false
    });

    if (address.latitude && address.longitude) {
      checkNoidaLocation(address.latitude, address.longitude);
    }
    
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
        {/* Back Banner */}
        {(returnTo === 'subscription' || fromCheckout) && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
            <p className="text-sm text-primary font-medium">
              {returnTo === 'subscription' 
                ? 'Add or edit your address, then return to complete your subscription'
                : 'Add or edit your address, then return to checkout'}
            </p>
            <Button 
              onClick={handleBack}
              size="sm"
              className="rounded-full"
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
                    />
                  </div>
                  {!formData.latitude && !formData.longitude && (
                    <p className="text-xs text-red-500 mt-2">Click on the map to pin your delivery location</p>
                  )}
                  
                  {/* Noida Warning */}
                  {formData.latitude && !isNoidaLocation && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Outside Delivery Area</p>
                        <p className="text-xs text-amber-700">We currently deliver only in Noida. You can save this address but won't be able to place orders to this location.</p>
                      </div>
                    </div>
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

        {/* Info Notice */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> You can add any address. Search by typing or pin your location on the map.
          </p>
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
          <div className="grid gap-4">
            {addresses.map((address) => {
              return (
                <Card 
                  key={address.id} 
                  data-testid={`address-card-${address.id}`}
                  className={`transition-all hover:shadow-md ${address.is_default ? 'border-primary border-2 bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            address.is_default ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-lg">{address.name || 'Address'}</span>
                            {address.is_default && (
                              <Badge className="ml-2 bg-primary text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-base text-gray-700 ml-10">{address.address_line}</p>
                        {address.pincode && (
                          <p className="text-sm text-muted-foreground ml-10 mt-1">PIN: {address.pincode}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-10 sm:ml-0">
                        {!address.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(address.id)}
                            className="rounded-full text-xs"
                            data-testid={`set-default-${address.id}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(address)}
                          className="rounded-full"
                          data-testid={`edit-address-${address.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                          data-testid={`delete-address-${address.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
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
