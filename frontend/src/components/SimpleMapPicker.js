import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Check if click is within NOIDA bounds
      if (lat >= 28.4 && lat <= 28.7 && lng >= 77.2 && lng <= 77.5) {
        setPosition([lat, lng]);
        onLocationSelect && onLocationSelect({ lat, lng });
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

const SimpleMapPicker = ({ onLocationSelect, initialLocation }) => {
  // Use a key to force remount when initialLocation changes
  const initialKey = initialLocation ? `${initialLocation.lat}-${initialLocation.lng}` : 'default';
  
  const [position, setPosition] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );

  return (
    <MapContainer
      center={position || NOIDA_CENTER}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker 
        position={position} 
        setPosition={setPosition} 
        onLocationSelect={onLocationSelect}
      />
    </MapContainer>
  );
};

export default SimpleMapPicker;
