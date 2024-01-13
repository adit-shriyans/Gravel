'use client'

import Image from 'next/image'
import { useEffect, useState, FC } from 'react';
import L from 'leaflet';
import MarkerIcon from '../node_modules/leaflet/dist/images/marker-icon.png';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MarkerLocation } from '@assets/types/types';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import '@styles/css/MapComponent.css'
import DraggableMarker from './DraggableMarker';
import { v4 as uuid } from 'uuid';

interface MCPropsType {
    stops: MarkerLocation[];
    setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
    zoomLocation: L.LatLngTuple;
    setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
    coord: L.LatLngTuple;
}

interface LMPropsType {
    stops: MarkerLocation[];
    setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
}

function LocationMarker({ stops, setStops }: LMPropsType) {
    const map = useMapEvents({
        async click(e) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
                const data = await response.json();

                const locationName = data.display_name || 'Unknown Location';
                setStops([...stops, { markerId: uuid(), location: [e.latlng.lat, e.latlng.lng], locationName }])
            } catch (error) {
                console.error('Error fetching location name:', error);
            }
        }
    })

    return null
}

export default function MapComponent({ stops, setStops, zoomLocation, setZoomLocation, coord }: MCPropsType) {
    useEffect(() => {
        setZoomLocation(coord);
    }, [coord]);

    const flyToMarker = (map: L.Map, coordinates: L.LatLngTuple, zoom: number) => {
        if (coordinates && typeof coordinates !== "undefined") {
            map.flyTo(coordinates, zoom, {
                animate: true,
                duration: 1.5,
            });
        }
    };

    const ZoomHandler: FC = () => {
        const map = useMap();

        useEffect(() => {
            if (zoomLocation && typeof zoomLocation !== "undefined") {
                flyToMarker(map, zoomLocation, 13);
            }
        }, [zoomLocation]);
        return null;
    };

    return (
        <div className="MapComponent">
            <MapContainer className='MapContainer' center={coord} zoom={13} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                    icon={
                        new L.Icon({
                            iconUrl: MarkerIcon.src,
                            iconRetinaUrl: MarkerIcon.src,
                            iconSize: [25, 41],
                            iconAnchor: [12.5, 41],
                            popupAnchor: [0, -41],
                        })
                    }
                    position={coord}
                >
                    <Popup>
                        Popup
                    </Popup>
                </Marker>
                {stops.map((place) => (
                    <DraggableMarker stops={stops} setStops={setStops} key={place.markerId} id={place.markerId} setZoomLocation={setZoomLocation} center={place.location} />
                ))}
                <ZoomHandler />
                <LocationMarker stops={stops} setStops={setStops} />
            </MapContainer>
        </div>
    );
}
