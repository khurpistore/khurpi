import React, { useState, useEffect, useRef } from 'react';
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

// Default center - India center (Delhi)
const DEFAULT_CENTER = [28.6139, 77.2090];

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect && onLocationSelect({ lat, lng });
    },
  });

  return position ? <Marker position={position} /> : null;
}

// Component to handle external location updates (from search)
function ExternalLocationHandler({ externalLocation, setPosition, lastExternalRef }) {
  const map = useMap();
  
  useEffect(() => {
    if (externalLocation) {
      const locationKey = `${externalLocation.lat}-${externalLocation.lng}`;
      
      // Only update if this is a new external location
      if (lastExternalRef.current !== locationKey) {
        lastExternalRef.current = locationKey;
        const newPos = [externalLocation.lat, externalLocation.lng];
        setPosition(newPos);
        map.flyTo(newPos, 15, { duration: 1 });
      }
    }
  }, [externalLocation, map, setPosition, lastExternalRef]);
  
  return null;
}

const SimpleMapPicker = ({ onLocationSelect, initialLocation, externalLocation }) => {
  const [position, setPosition] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );
  
  // Track the last external location to prevent repeated updates
  const lastExternalRef = useRef(null);

  return (
    <MapContainer
      center={position || DEFAULT_CENTER}
      zoom={position ? 15 : 5}
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
      <ExternalLocationHandler 
        externalLocation={externalLocation}
        setPosition={setPosition}
        lastExternalRef={lastExternalRef}
      />
    </MapContainer>
  );
};

export default SimpleMapPicker;
