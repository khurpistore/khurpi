import React, { useState, useEffect } from 'react';
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
      setPosition([lat, lng]);
      onLocationSelect && onLocationSelect({ lat, lng });
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

// Component to update map view when external location changes
function MapUpdater({ externalPosition, setPosition }) {
  const map = useMap();
  
  useEffect(() => {
    if (externalPosition) {
      setPosition(externalPosition);
      map.flyTo(externalPosition, 15);
    }
  }, [externalPosition, map, setPosition]);
  
  return null;
}

const SimpleMapPicker = ({ onLocationSelect, initialLocation, externalLocation }) => {
  const [position, setPosition] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );

  // Convert external location to array format
  const externalPosition = externalLocation ? [externalLocation.lat, externalLocation.lng] : null;

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
      <MapUpdater 
        externalPosition={externalPosition}
        setPosition={setPosition}
      />
    </MapContainer>
  );
};

export default SimpleMapPicker;
