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

// India center coordinates
const INDIA_CENTER = [20.5937, 78.9629];

function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect && onLocationSelect(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return position ? (
    <Marker position={position}>
      <Popup>Delivery Location</Popup>
    </Marker>
  ) : null;
}

const LocationPicker = ({ onLocationSelect, onClose, initialAddress = null }) => {
  const [position, setPosition] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    addressLine: initialAddress?.address_line || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    pincode: initialAddress?.pincode || '',
    isDefault: false,
  });

  useEffect(() => {
    if (initialAddress?.latitude && initialAddress?.longitude) {
      setPosition([initialAddress.latitude, initialAddress.longitude]);
    }
  }, [initialAddress]);

  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please select manually on the map.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (!position) {
      alert('Please select a location on the map');
      return;
    }
    if (!addressDetails.addressLine) {
      alert('Please enter your address details');
      return;
    }
    if (!addressDetails.city) {
      alert('Please enter city name');
      return;
    }
    if (!addressDetails.pincode) {
      alert('Please enter PIN code');
      return;
    }

    onLocationSelect({
      latitude: position[0],
      longitude: position[1],
      address_line: addressDetails.addressLine,
      city: addressDetails.city,
      state: addressDetails.state,
      pincode: addressDetails.pincode,
      is_default: addressDetails.isDefault,
    });
  };

  const handleLocationSelect = (lat, lng) => {
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.address) {
          setAddressDetails(prev => ({
            ...prev,
            addressLine: data.display_name?.split(',').slice(0, 3).join(', ') || '',
            city: data.address.city || data.address.town || data.address.county || '',
            state: data.address.state || '',
            pincode: data.address.postcode || '',
          }));
        }
      })
      .catch(err => console.error('Geocoding error:', err));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Select Delivery Location
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="flex-1"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {gettingLocation ? 'Getting location...' : 'Use My Current Location'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Click on the map to pin your delivery location
        </div>

        <div className="h-64 rounded-lg overflow-hidden border">
          <MapContainer
            center={position || INDIA_CENTER}
            zoom={position ? 14 : 5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              onLocationSelect={handleLocationSelect}
            />
          </MapContainer>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Address *</Label>
            <Input
              value={addressDetails.addressLine}
              onChange={(e) => setAddressDetails(prev => ({ ...prev, addressLine: e.target.value }))}
              placeholder="House no, Building, Street, Area"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input
                value={addressDetails.city}
                onChange={(e) => setAddressDetails(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={addressDetails.state}
                onChange={(e) => setAddressDetails(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
              />
            </div>
          </div>

          <div>
            <Label>PIN Code *</Label>
            <Input
              value={addressDetails.pincode}
              onChange={(e) => setAddressDetails(prev => ({ ...prev, pincode: e.target.value }))}
              placeholder="Enter PIN code"
              maxLength={6}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="default-address"
              checked={addressDetails.isDefault}
              onCheckedChange={(checked) => setAddressDetails(prev => ({ ...prev, isDefault: checked }))}
            />
            <Label htmlFor="default-address" className="text-sm">Set as default address</Label>
          </div>
        </div>

        <Button onClick={handleConfirm} className="w-full">
          Confirm Location
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
