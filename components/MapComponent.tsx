'use client'

import { useEffect, FC } from 'react';
import L from 'leaflet';
import CurrentLocationIcon from "../assets/currentlocation.png";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MarkerLocation } from '@assets/types/types';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import '@styles/css/MapComponent.css'
import DraggableMarker from './DraggableMarker';
import { z, ZodError } from 'zod';
import { useParams } from 'next/navigation';

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
    tripId: String | String[];
    setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
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

function LocationMarker({ stops, setStops, tripId, setZoomLocation }: LMPropsType) {
    const map = useMapEvents({
        async click(e) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
                const data = await response.json();

                const parsedData = geocodingResponseSchema.parse(data);

                const locationName = parsedData.display_name || 'Unknown Location';

                const createStopResponse = await fetch("/api/stop/new", {
                    method: "POST",
                    body: JSON.stringify({
                        stopId: stops.length,
                        tripId: tripId,
                        location: [e.latlng.lat, e.latlng.lng],
                        locationName,
                        startDate: '',
                        endDate: '',
                        notes: ''
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!createStopResponse.ok) {
                    console.error('Failed to create trip:', createStopResponse.statusText);
                    return;
                }

                const createdStop = await createStopResponse.json();

                setStops([...stops, { markerId: createdStop._id, location: createdStop.location, locationName }])
                setZoomLocation(createdStop.location);
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
    const params = useParams();

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
                            iconUrl: CurrentLocationIcon.src,
                            iconRetinaUrl: CurrentLocationIcon.src,
                            iconSize: [30, 41],
                            iconAnchor: [12.5, 41],
                            popupAnchor: [0, -41],
                        })
                    }
                    position={coord}
                >
                    <Popup>
                        Your Location
                    </Popup>
                </Marker>
                {stops.map((place) => (
                    <DraggableMarker stops={stops} setStops={setStops} key={place.markerId} id={place.markerId} setZoomLocation={setZoomLocation} center={place.location} />
                ))}
                <ZoomHandler />
                <LocationMarker stops={stops} setStops={setStops} tripId={params.id} setZoomLocation={setZoomLocation} />
            </MapContainer>
        </div>
    );
}
