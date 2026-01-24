import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Edit2, Trash2, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';

const Addresses = () => {
  const { user, addresses, addAddress, updateAddressById, deleteAddress, setDefaultAddress, fetchAddresses } = useAuth();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    address_line: '',
    latitude: null,
    longitude: null,
    is_default: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user, navigate]);

  const resetForm = () => {
    setFormData({
      address_line: '',
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
      longitude: location.lng,
      address_line: location.address || prev.address_line
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.address_line.toUpperCase().includes('NOIDA')) {
      toast.error('We currently deliver only in NOIDA area');
      return;
    }

    setLoading(true);
    try {
      if (editingAddress) {
        await updateAddressById(editingAddress.id, formData);
        toast.success('Address updated successfully');
      } else {
        await addAddress(formData);
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
      address_line: address.address_line,
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
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Select Location on Map</Label>
                  <div className="mt-2 h-64 rounded-lg overflow-hidden border">
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={formData.latitude && formData.longitude ? {
                        lat: formData.latitude,
                        lng: formData.longitude
                      } : null}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on the map to select your delivery location
                  </p>
                </div>

                <div>
                  <Label htmlFor="address_line">Full Address *</Label>
                  <Input
                    id="address_line"
                    value={formData.address_line}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line: e.target.value }))}
                    placeholder="Enter your full address (must include NOIDA)"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We currently deliver only in NOIDA area
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Set as default address
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : editingAddress ? 'Update' : 'Add Address'}
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
                data-testid={`address-${address.id}`}
                className={`transition-all ${address.is_default ? 'border-primary border-2' : ''}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {address.is_default && (
                          <Badge className="bg-primary text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-base sm:text-lg">{address.address_line}</p>
                      {address.latitude && address.longitude && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Coordinates: {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="rounded-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
