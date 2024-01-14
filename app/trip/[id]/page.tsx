"use client";
import '@styles/css/index.css'
import { MarkerLocation, TripType } from '@assets/types/types';
import SidePanel from "@components/SidePanel";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const DynamicMapComponent = dynamic(() => import("@components/MapComponent"), { ssr: false });

const MyPage = () => {
    const pathName = usePathname();
    const savedTrips = localStorage.getItem('trips');
    let savedStops: MarkerLocation[]=[];
    if (savedTrips) {
        const trips: TripType[] = JSON.parse(savedTrips);
        trips.map((trip) => {
            if (trip._id === pathName.split('/')[2])
                savedStops=trip.stops;
        })
    }

    const [stops, setStops] = useState<MarkerLocation[]>(savedStops);
    const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
    const [zoomLocation, setZoomLocation] = useState<L.LatLngTuple>([51.505, -0.09]);

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
        const savedTrips = localStorage.getItem('trips');
        if (savedTrips) {
            const trips: TripType[] = JSON.parse(savedTrips);
            const newTrips = trips.map((trip) => {
                if (trip._id === pathName.split('/')[2]) {
                    return { ...trip, stops: stops }
                }
                return trip
            })

            localStorage.setItem('trips', JSON.stringify(newTrips))
        }
    }, [stops])

    return (
        <div className="Page w-full flex flex-row">
            <SidePanel stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} coord={coord} />
            <DynamicMapComponent stops={stops} setStops={setStops} zoomLocation={zoomLocation} setZoomLocation={setZoomLocation} coord={coord} />
        </div>
    );
};

export default MyPage;