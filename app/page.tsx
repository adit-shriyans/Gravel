"use client";
import '@styles/css/index.css'
import { TripType } from '@assets/types/types';
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

const MyPage = () => {
  const [trips, setTrips] = useState<TripType[]>([]);

  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
  }, []);

  const handleCreateClick = () => {
    const tripId = uuid();
    setTrips((prevTrips) => [...prevTrips, { _id: tripId, stops:[], status: 'upcoming' }]);
    localStorage.setItem('trips', JSON.stringify([...trips, { _id: tripId, stops:[], status: 'upcoming' }]));
    router.push(`/trip/${tripId}`);
  };

  return (
    <div className="Page w-full h-1/2 flex flex-row">
      <button onClick={handleCreateClick}>Create</button>
      {trips.map((trip, id) => (
        <button key={id} onClick={() => {router.push(`/trip/${trip._id}`);}}>Click</button>
      ))}
    </div>
  );
};

export default MyPage;