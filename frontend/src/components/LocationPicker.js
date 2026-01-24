import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, X, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// NOIDA center coordinates
const NOIDA_CENTER = [28.5355, 77.3910];
const NOIDA_BOUNDS = [
  [28.4, 77.2],  // Southwest
  [28.7, 77.5]   // Northeast
];

function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Check if click is within NOIDA bounds
      if (lat >= 28.4 && lat <= 28.7 && lng >= 77.2 && lng <= 77.5) {
        setPosition([lat, lng]);
        onLocationSelect && onLocationSelect(lat, lng);
      } else {
        alert('Please select a location within NOIDA area only');
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return position ? (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <strong>Selected Location</strong><br />
          Lat: {position[0].toFixed(4)}<br />
          Lng: {position[1].toFixed(4)}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

const LocationPicker = ({ 
  initialData = null,
  onSave, 
  onCancel,
  loading = false,
  isEdit = false,
  showSetDefault = false,
  isDefault = false
}) => {
  const [position, setPosition] = useState(
    initialData?.latitude && initialData?.longitude 
      ? [initialData.latitude, initialData.longitude] 
      : NOIDA_CENTER
  );
  const [formData, setFormData] = useState({
    addressLine1: initialData?.address_line1 || '',
    addressLine2: initialData?.address_line2 || '',
    city: 'NOIDA',
    pincode: initialData?.pincode || '',
    landmark: initialData?.landmark || ''
  });
  const [setAsDefault, setSetAsDefault] = useState(isDefault);
  const [locating, setLocating] = useState(false);

  // Parse existing address if editing
  useEffect(() => {
    if (initialData?.address_line && !initialData?.address_line1) {
      // Try to parse the full address line
      const parts = initialData.address_line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        setFormData(prev => ({
          ...prev,
          addressLine1: parts[0] || '',
          addressLine2: parts.slice(1, -2).join(', ') || '',
          pincode: parts[parts.length - 1]?.match(/\d{6}/)?.[0] || ''
        }));
      }
    }
  }, [initialData]);

  const handleLocationSelect = (lat, lng) => {
    setPosition([lat, lng]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (latitude >= 28.4 && latitude <= 28.7 && longitude >= 77.2 && longitude <= 77.5) {
          setPosition([latitude, longitude]);
        } else {
          alert('Your current location is outside NOIDA. Please select a location within NOIDA.');
        }
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please select on map.');
        setLocating(false);
      }
    );
  };

  const handleSave = () => {
    if (!formData.addressLine1.trim()) {
      alert('Please enter Address Line 1');
      return;
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    // Construct full address
    const fullAddress = [
      formData.addressLine1,
      formData.addressLine2,
      formData.landmark,
      formData.city,
      `UP ${formData.pincode}`
    ].filter(Boolean).join(', ');

    onSave({
      address_line: fullAddress,
      address_line1: formData.addressLine1,
      address_line2: formData.addressLine2,
      city: formData.city,
      pincode: formData.pincode,
      landmark: formData.landmark,
      latitude: position[0],
      longitude: position[1],
      is_default: setAsDefault
    });
  };

  return (
    <Card className="border-green-200 shadow-md">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg text-primary flex items-center gap-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          {isEdit ? 'Edit Address' : 'Add New Address'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="space-y-4">
          {/* Map */}
          <div>
            <Label className="text-sm mb-2 block">Select Location on Map</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Click on the map to pin your delivery location in NOIDA
            </p>
            <div className="rounded-lg overflow-hidden border border-green-200" style={{ height: '200px' }}>
              <MapContainer
                center={position || NOIDA_CENTER}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                maxBounds={NOIDA_BOUNDS}
                maxBoundsViscosity={1.0}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                  position={position} 
                  setPosition={setPosition} 
                  onLocationSelect={handleLocationSelect}
                />
              </MapContainer>
            </div>
          </div>

          {/* Current Location Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {locating ? 'Locating...' : 'Use My Current Location'}
          </Button>

          {/* Address Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine1" className="text-sm">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                data-testid="address-line1-input"
                placeholder="House/Flat No., Building Name"
                value={formData.addressLine1}
                onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine2" className="text-sm">Address Line 2</Label>
              <Input
                id="addressLine2"
                data-testid="address-line2-input"
                placeholder="Street, Area, Sector"
                value={formData.addressLine2}
                onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input
                id="city"
                value="NOIDA"
                disabled
                className="mt-1 bg-gray-100"
              />
              <p className="text-xs text-muted-foreground mt-1">Currently serving NOIDA only</p>
            </div>
            <div>
              <Label htmlFor="pincode" className="text-sm">Pincode *</Label>
              <Input
                id="pincode"
                data-testid="pincode-input"
                placeholder="201301"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="landmark" className="text-sm">Landmark</Label>
              <Input
                id="landmark"
                data-testid="landmark-input"
                placeholder="Near School, Behind Mall, etc."
                value={formData.landmark}
                onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          {/* Set as Default */}
          {showSetDefault && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-default"
                checked={setAsDefault}
                onCheckedChange={setSetAsDefault}
              />
              <Label htmlFor="set-default" className="text-sm cursor-pointer">
                Set as default delivery address
              </Label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              data-testid="save-address-button"
              onClick={handleSave}
              disabled={loading || !formData.addressLine1.trim() || !formData.pincode.trim()}
              className="bg-primary hover:bg-primary/90 rounded-full flex-1 sm:flex-none text-sm"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Address' : 'Save Address')}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-full flex-1 sm:flex-none text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
