import { useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = { height: '300px', width: '100%' };

export default function MapPicker({ initialPosition = [0,0], onSelect }) {
  const [position, setPosition] = useState({ lat: initialPosition[0], lng: initialPosition[1] });
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const handleClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPosition({ lat, lng });
    if (onSelect) onSelect(lat, lng);
  };

  if (!isLoaded) return <div>Chargement de la carte...</div>;

  return (
    <GoogleMap
      center={position}
      zoom={13}
      mapContainerStyle={containerStyle}
      onClick={handleClick}
    >
      <Marker position={position} />
    </GoogleMap>
  );
}
