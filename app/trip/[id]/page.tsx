"use client";
import '@styles/css/index.css'
import { MarkerLocation, StopResponseType, TripType } from '@assets/types/types';
import SidePanel from "@components/SidePanel";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

const DynamicMapComponent = dynamic(() => import("@components/MapComponent"), { ssr: false });

const MyPage = () => {
    const [stops, setStops] = useState<MarkerLocation[]>([]);
    const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
    const [zoomLocation, setZoomLocation] = useState<L.LatLngTuple>([51.505, -0.09]);

    const params = useParams();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (location) {
                const { latitude, longitude } = location.coords;
                setCoord([latitude, longitude]);
            }, function () {
                console.log('Could not get position');
            });
        }        
    }, []);

    useEffect(() => {
        const fetchStops = async () => {
          const response = await fetch(`/api/stop/${params?.id}`, {
            method: 'GET'
          });
          const data = await response.json();

          setStops(data.map((stop: StopResponseType) => {
            return {markerId: stop._id, location: stop.location, locationName: stop.locationName, startDate: stop.startDate, endDate: stop.endDate, notes: stop.notes}
          }))
        };
    
        if (params?.id) fetchStops();
      }, [params.id]);

    return (
        <div className="TripPage">
            <SidePanel stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} coord={coord} />
            <DynamicMapComponent stops={stops} setStops={setStops} zoomLocation={zoomLocation} setZoomLocation={setZoomLocation} coord={coord} />
        </div>
    );
};

export default MyPage;