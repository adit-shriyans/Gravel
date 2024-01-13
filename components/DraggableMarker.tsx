import { useEffect, useState, useRef, useMemo, useCallback, FC } from 'react';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MarkerLocation } from '@assets/types/types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';

interface DraggableMarkerProps {
  stops: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  center: L.LatLngTuple;
  id: string;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
}

export default function DraggableMarker({ stops, setStops, center, id, setZoomLocation }: DraggableMarkerProps) {
  const [position, setPosition] = useState<L.LatLngTuple>(center);
  const markerRef = useRef<L.Marker | null>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {        
        const marker = markerRef.current;
        if (isMarker(marker)) {
          const markerLocation = marker.getLatLng();
          setPosition([markerLocation.lat, markerLocation.lng]);
          getLocationName([markerLocation.lat, markerLocation.lng]);
        }
      },
    }),
    []
  );

  const getLocationName = async (location: L.LatLngTuple) => {    
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[0]}&lon=${location[1]}`);
    const data = await response.json();
  
    const newName = data.display_name || 'Unknown Location';
  
    setStops((prevStops) => {
      return prevStops.map((place) => {
        if (place.markerId === id) {
          setZoomLocation(location);
          return { ...place, location: location, locationName: newName };
        }
        return place;
      });
    });
  };
  

  const isMarker = (marker: any): marker is L.Marker => {
    return marker !== null && typeof marker.getLatLng === 'function';
  };

  return (
    <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} zIndexOffset={10000}>
      <Popup minWidth={90}>
        <span>
          Draggable
        </span>
      </Popup>
    </Marker>
  );
}
