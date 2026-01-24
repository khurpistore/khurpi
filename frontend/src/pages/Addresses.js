import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Edit2, Trash2, Star, CheckCircle, ArrowLeft, Home, Building2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import SimpleMapPicker from '@/components/SimpleMapPicker';

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
    city: 'NOIDA',
    pincode: '',
    latitude: null,
    longitude: null,
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  
  // Check if coming from subscription flow
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo');

  // Handle return to subscription
  const handleBackToSubscription = () => {
    navigate('/subscription/create?restored=true');
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
      city: 'NOIDA',
      pincode: '',
      latitude: null,
      longitude: null,
      is_default: false
    });
    setEditingAddress(null);
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
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
    
    const fullAddress = buildAddressLine();
    
    if (!fullAddress.toUpperCase().includes('NOIDA')) {
      toast.error('We currently deliver only in NOIDA area');
      return;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code');
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
        toast.success('Address updated successfully');
      } else {
        await addAddress(addressData);
        toast.success('Address added successfully');
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
    setFormData({
      name: address.name || '',
      address_line_1: address.address_line_1 || address.address_line || '',
      address_line_2: address.address_line_2 || '',
      area: address.area || '',
      city: address.city || 'NOIDA',
      pincode: address.pincode || '',
      latitude: address.latitude,
      longitude: address.longitude,
      is_default: address.is_default
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteAddress(addressId);
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Subscription Banner */}
        {returnTo === 'subscription' && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
            <p className="text-sm text-primary font-medium">
              Add or edit your address, then return to complete your subscription
            </p>
            <Button 
              onClick={handleBackToSubscription}
              size="sm"
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Subscription
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
                {/* Address Label */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Home className="w-4 h-4" />
                    Address Label
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

                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={formData.city}
                        disabled
                        className="bg-gray-100 flex-1"
                      />
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        Delivery Area
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map Location */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Navigation className="w-4 h-4" />
                      Pin Location
                    </div>
                    {formData.latitude && formData.longitude && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Set
                      </span>
                    )}
                  </div>
                  <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
                    <SimpleMapPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={formData.latitude && formData.longitude ? {
                        lat: formData.latitude,
                        lng: formData.longitude
                      } : null}
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
          <div className="grid gap-4">
            {addresses.map((address) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
