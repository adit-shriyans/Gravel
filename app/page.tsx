"use client";
import '@styles/css/index.css'
import { StatusType, TripType, VoidFunctionType } from '@assets/types/types';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import demoImg from '../assets/sitedemo.png';
import Image from 'next/image';
import TelegramIcon from '@mui/icons-material/Telegram';
import TripCard from '@components/TripCard';
import StatusSelector from '@components/StatusSelector';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
    };
  }
}

const MyPage = () => {
  const { data: session } = useSession();
  const {trips, tripLoading, setTripLoading, setTrips} = useTrips(session?.user?.id || '')
  const [tripStatus, setTripStatus] = useState<String>('')

  const showedTrips = useMemo(() => {
    if (tripStatus === '') return trips;
    return trips.filter((trip: TripType) => trip.status === tripStatus as StatusType | '');
  }, [tripStatus, trips]);

  const router = useRouter();

  useEffect(() => {
    if(trips.length) setTripLoading(false);
  }, [trips]);

  const handleCreateClick = async () => {
    if(session && session.user && session.user.id) {
      try {
        const createTripResponse = await fetch("/api/trip/new", {
          method: "POST",
          body: JSON.stringify({
            userId: session?.user?.id,
            name: 'Trip Nameee',
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

        router.push(`/trip/${createdTrip._id}`);
      } catch (error) {
        console.error('Error creating trip:', error);
      }
    }
    else {
      alert("login first");
    }
  };

  const handleToggleClick = (slug: String) => {
    if (slug === "one") setTripStatus('');
    else if (slug === "two") setTripStatus('upcoming');
    else if (slug === "three") setTripStatus('ongoing');
    else if (slug === "four") setTripStatus('completed');
    // filterTrips();
  }

  return (
    <div className="Page">
      <div className='Page__demoImg'>
        <Image
          src={demoImg}
          alt='Demo'
        />
      </div>
      <button className='Page__plan' onClick={handleCreateClick}>
        <TelegramIcon />
        Plan a Trip!
      </button>
      <div className='Page__userTrips'>
        <div className='Page__heading'>
          <fieldset>
            <legend>
              Your Trips
            </legend>
          </fieldset>
        </div>
        <div className='Page__statusToggle'>
          <StatusSelector
            onSelectedItem={(item: { slug: "one" | "two" | "three" | "four"; }) => {
              handleToggleClick(item.slug);
            }}
          />
        </div>
        <div className='Page__trips'>
          {showedTrips.length !== 0 ? (
            showedTrips.map((trip: TripType) => (
              <TripCard key={trip._id} trip={trip} trips={trips} setTrips={setTrips} />
            ))) :
            (
              <div className='Page__NA'>
                {session?.user.id ? 
                  tripLoading?(
                    'loading...'
                  ):
                  trips.length ? (
                  `No ${tripStatus} trips`
                ) : (
                  'No trips planned'
                ) :
                (
                  'Login to view your trips'
                )}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

const useTrips = (userId: String) => {
  const [trips, setTrips] = useState<TripType[]>([]);
  const [tripLoading, setTripLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/trip/user/${userId}`);
          const data = await response.json();

          const allTrips = data.map((trip: TripType) => ({
            _id: trip._id,
            name: trip.name || 'Your Trip',
            stops: [],
            status: trip.status,
          }));

          setTrips(allTrips);
        } catch (error) {
          console.error('Error fetching trips:', error);
        } finally {
          setTripLoading(false);
        }
      }
    };

    fetchTrips();
  }, [userId]);

  return { trips, tripLoading, setTripLoading, setTrips };
}

export default MyPage;