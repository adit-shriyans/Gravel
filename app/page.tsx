"use client";
import '@styles/css/index.css'
import { MarkerLocation } from '@assets/types/types';
import SidePanel from "@components/SidePanel";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
const DynamicMapComponent = dynamic(() => import("@components/MapComponent"), { ssr: false });

const MyPage = () => {
  const [stops, setStops] = useState<MarkerLocation[]>([]);
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

  return (
    <div className="Page w-full flex flex-row">
      <SidePanel stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} coord={coord} />
      <DynamicMapComponent stops={stops} setStops={setStops} zoomLocation={zoomLocation} setZoomLocation={setZoomLocation} coord={coord} />
    </div>
  );
};

export default MyPage;