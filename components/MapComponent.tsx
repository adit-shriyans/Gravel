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
import { z, ZodError } from 'zod';

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

const geocodingResponseSchema = z.object({
    place_id: z.number(),
    licence: z.string(),
    osm_type: z.string(),
    osm_id: z.number(),
    lat: z.string(),
    lon: z.string(),
    class: z.string(),
    type: z.string(),
    place_rank: z.number(),
    importance: z.number(),
    addresstype: z.string(),
    name: z.string(),
    display_name: z.string(),
    address: z.record(z.unknown()),
    boundingbox: z.array(z.string()),
  });

const responseSchema = z.object({
    data: geocodingResponseSchema,
});

function LocationMarker({ stops, setStops }: LMPropsType) {
    const map = useMapEvents({
        async click(e) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
                const data = await response.json();
                
                const parsedData = geocodingResponseSchema.parse(data);

                const locationName = parsedData.display_name || 'Unknown Location';
                
                setStops([...stops, { markerId: uuid(), location: [e.latlng.lat, e.latlng.lng], locationName }])
              } catch (error) {
                if (error instanceof ZodError) {
                  console.error('Validation error:', error.errors);
                } else {
                  console.error('Error fetching location name:', error);
                }
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
