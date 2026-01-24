import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Check if click is within NOIDA bounds
      if (lat >= 28.4 && lat <= 28.7 && lng >= 77.2 && lng <= 77.5) {
        setPosition([lat, lng]);
      } else {
        // Show toast or alert that only NOIDA area is allowed
        alert('Please select a location within NOIDA area only');
      }
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        Selected Location<br />
        Lat: {position[0].toFixed(4)}<br />
        Lng: {position[1].toFixed(4)}
      </Popup>
    </Marker>
  ) : null;
}

const LocationPicker = ({ address, setAddress, onSave, loading }) => {
  const [position, setPosition] = useState(NOIDA_CENTER);
  const [manualAddress, setManualAddress] = useState(address || '');

  useEffect(() => {
    setManualAddress(address || '');
  }, [address]);

  const handleUseLocation = () => {
    if (position) {
      const locationText = `Location: Lat ${position[0].toFixed(4)}, Lng ${position[1].toFixed(4)}, NOIDA, UP`;
      setManualAddress(prev => {
        // If address already has text, append location, otherwise just use location
        if (prev && !prev.includes('Lat')) {
          return `${prev}\n${locationText}`;
        }
        return locationText;
      });
    }
  };

  const handleSave = () => {
    setAddress(manualAddress);
    onSave();
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <Label className="mb-2 block">Select Location on Map</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Click on the map to select your delivery location in NOIDA
        </p>
        
        <div className="rounded-lg overflow-hidden border border-border mb-4" style={{ height: '300px' }}>
          <MapContainer
            center={NOIDA_CENTER}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            maxBounds={NOIDA_BOUNDS}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseLocation}
          className="mb-3 w-full sm:w-auto"
        >
          📍 Use Selected Map Location
        </Button>

        <div>
          <Label htmlFor="address">Complete Address</Label>
          <Textarea
            id="address"
            data-testid="address-input"
            placeholder="Enter house/flat number, sector, landmarks in NOIDA"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="mt-1 min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            * We currently deliver only in NOIDA area
          </p>
        </div>

        <Button
          data-testid="save-address-button"
          onClick={handleSave}
          disabled={loading || !manualAddress}
          className="mt-4 bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
