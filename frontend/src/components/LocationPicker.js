import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  initialAddress = '', 
  initialLat = null, 
  initialLng = null,
  onSave, 
  onCancel,
  loading = false,
  isEdit = false,
  showSetDefault = false,
  isDefault = false
}) => {
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : NOIDA_CENTER
  );
  const [addressText, setAddressText] = useState(initialAddress);
  const [setAsDefault, setSetAsDefault] = useState(isDefault);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setAddressText(initialAddress);
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialAddress, initialLat, initialLng]);

  const handleLocationSelect = (lat, lng) => {
    // Append coordinates to address if not already there
    const coordsText = `(Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
    if (!addressText.includes('Lat:')) {
      setAddressText(prev => prev ? `${prev}\n${coordsText}` : coordsText);
    } else {
      // Replace existing coordinates
      setAddressText(prev => prev.replace(/\(Lat: [\d.]+, Lng: [\d.]+\)/, coordsText));
    }
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
        // Check if within NOIDA bounds
        if (latitude >= 28.4 && latitude <= 28.7 && longitude >= 77.2 && longitude <= 77.5) {
          setPosition([latitude, longitude]);
          handleLocationSelect(latitude, longitude);
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
    if (!addressText.trim()) {
      alert('Please enter an address');
      return;
    }
    
    // Validate NOIDA
    if (!addressText.toUpperCase().includes('NOIDA')) {
      alert('Please include NOIDA in your address. We currently deliver only in NOIDA area.');
      return;
    }

    onSave({
      address_line: addressText.trim(),
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
            <div className="rounded-lg overflow-hidden border border-green-200" style={{ height: '250px' }}>
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

          {/* Address Text */}
          <div>
            <Label htmlFor="address-input" className="text-sm">Complete Address</Label>
            <Textarea
              id="address-input"
              data-testid="address-input"
              placeholder="Enter house/flat number, sector, landmarks in NOIDA"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="mt-1 min-h-[80px] sm:min-h-[100px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              * We currently deliver only in NOIDA area
            </p>
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
              disabled={loading || !addressText.trim()}
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
