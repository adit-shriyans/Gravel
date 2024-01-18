"use client";
import '@styles/css/index.css'
import { StatusType, TripType } from '@assets/types/types';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import demoImg from '../assets/sitedemo.png';
import Image from 'next/image';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
    };
  }
}

const MyPage = () => {
  const [trips, setTrips] = useState<TripType[]>([]);
  const { data: session } = useSession();

  const pathName = usePathname();
  const router = useRouter();

  const fetchTrips = async () => {
    const response = await fetch('/api/trip');
    const data = await response.json();
    const allTrips: TripType[] = data.map((trip: any) => {
      return { _id: trip._id, stops: [], status: trip.status }
    });
    setTrips(allTrips);
  }

  useEffect(() => {
    // const savedTrips = localStorage.getItem('trips');
    fetchTrips();
    // if (savedTrips) {
    //   setTrips(JSON.parse(savedTrips));
    // }
  }, []);

  const handleCreateClick = async () => {
    try {
      const tripId = uuid();
      const createTripResponse = await fetch("/api/trip/new", {
        method: "POST",
        body: JSON.stringify({
          tripId: tripId,
          userId: session?.user?.id,
          status: "upcoming",
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!createTripResponse.ok) {
        console.error('Failed to create trip:', createTripResponse.statusText);
        return;
      }

      const createdTrip = await createTripResponse.json();

      // setTrips((prevTrips) => [...prevTrips, { _id: createdTrip._id, stops: [], status: "upcoming" as unknown as StatusType }]);
      // localStorage.setItem('trips', JSON.stringify([...trips, { _id: createdTrip._id, stops: [], status: "upcoming" as unknown as StatusType }]));
      router.push(`/trip/${createdTrip._id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };



  return (
    <div className="Page">
      <div className='Page__demoImg'>
        <Image 
          src={demoImg}
          alt='Demo'
        />
      </div>
      <button onClick={handleCreateClick}>Create</button>
      {trips.map((trip, id) => (
        <button key={id} onClick={() => { router.push(`/trip/${trip._id}`); }}>Click</button>
      ))}
    </div>
  );
};

export default MyPage;