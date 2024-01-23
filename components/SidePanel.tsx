'use client';

import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import '@styles/css/SidePanel.css'
import PlaceInfo from './PlaceInfo';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import totalDistImg from '../assets/totalDistance.png';
import Image from 'next/image';
import { MarkerLocation } from '@assets/types/types';
import { z, ZodError } from 'zod';
import { calculateDistance, compareDates, getNumberOfDays, getTodaysDate, isValidDate } from '@assets/CalcFunctions';
import { useParams } from 'next/navigation';

interface SPPropsType {
  stops: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
  coord: L.LatLngTuple;
}

const geocodingResponseSchema = z.array(
  z.object({
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
    boundingbox: z.array(z.string()),
  })
);

const SidePanel = ({ stops, setStops, setZoomLocation, coord }: SPPropsType) => {
  const [scrolled, setScrolled] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);
  const [addCoords, setAddCoords] = useState<L.LatLngTuple | []>([]);
  const [reqLocation, setReqLocation] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [tripDates, setTripDates] = useState<string[]>([getTodaysDate(), getTodaysDate()]);
  const [noOfDays, setNoOfDays] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const params = useParams();

  useEffect(() => {    
    let dist = 0;
    let sDate = stops[0]?.startDate || getTodaysDate();
    let eDate = stops[stops.length - 1]?.endDate || getTodaysDate();
    if (sDate && eDate && isValidDate(sDate) && isValidDate(eDate)) setTripDates([sDate, eDate]);
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].startDate !== undefined && compareDates(stops[i].startDate!, tripDates[0]) === -1) setTripDates([stops[i].startDate!, tripDates[1]])
      if (stops[i].endDate !== undefined && compareDates(stops[i].endDate!, tripDates[1]) === 1) setTripDates([tripDates[0], stops[i].endDate!])
      if (i === 0) dist += parseFloat(calculateDistance(stops[i].location, coord).toFixed(2))
      else dist += parseFloat(calculateDistance(stops[i].location, stops[i - 1].location).toFixed(2))
    }
    setTotalDistance(parseFloat(dist.toFixed(2)));
  }, [stops])

  useEffect(() => {
    if(isValidDate(tripDates[0]) && isValidDate(tripDates[1]))
      setNoOfDays(getNumberOfDays(tripDates[0], tripDates[1]));  
  }, [tripDates[0], tripDates[1]]);

  useEffect(() => {
    if (addingLocation) {
      inputRef.current?.focus();
    }
  }, [addingLocation])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(true);
      const element = document.querySelector('.SidePanel');
      const distance = element?.scrollTop;
      document.documentElement.style.setProperty('--scroll-distance', `${distance}px`);
    };

    const element = document.querySelector('.SidePanel');
    element?.addEventListener('scroll', handleScroll);

    return () => {
      element?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (reqLocation) {
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(reqLocation)}`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const parsedData = geocodingResponseSchema.safeParse(data);

          if (parsedData.success) {
            const location = parsedData.data[0];
            const latitude = parseFloat(location.lat);
            const longitude = parseFloat(location.lon);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              setAddCoords([latitude, longitude]);
            } else {
              console.error(`Invalid latitude or longitude for ${reqLocation}`);
            }
          } else {
            console.error('Geocoding response validation error:', parsedData.error);
          }
        })
        .catch(error => console.error('Error fetching geocoding data', error));
    }
  }, [reqLocation]);

  const markNewLocation = async ([latitude, longitude]: L.LatLngTuple) => {
    const createStopResponse = await fetch("/api/stop/new", {
      method: "POST",
      body: JSON.stringify({
          stopId: stops.length,
          tripId: params.id,
          location: [latitude, longitude],
          locationName: reqLocation,
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

  setStops([...stops, { markerId: createdStop._id, location: createdStop.location, locationName: createdStop.locationName }])
  }

  const handleAddFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setReqLocation(e.target.value);
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (addCoords.length !== 0) {
        markNewLocation(addCoords);
        setZoomLocation(addCoords);
      }
      setReqLocation('');
      setAddingLocation(false);
    }
  }

  const handleInputBlur = () => {
    setAddingLocation(false);
  };

  return (
    <div className={`SidePanel ${scrolled ? 'SideWindow' : ''}`}>
      <h1 className='SidePanel__heading'>Travel List!</h1>
      <div className='TripInfo'>
        <div className='TripInfo__dist'>
          <div className='TripInfo__dist-img'>
            <Image src={totalDistImg} alt='total distance' />
          </div>
          <div className='TripInfo__dist-text'>
            {totalDistance}km
          </div>
        </div>

        <div className='TripInfo__days'>
          <div className='TripInfo__days-img'>
            <EventNoteIcon />
          </div>
          <div className='TripInfo__days-text'>
            {noOfDays} Days
          </div>
        </div>
      </div>
      <div className='addStop'>
        <div
          className='addStop__content'
          onClick={() => setAddingLocation(!addingLocation)}
        >
          <div
            className='addStop__img'
          >
            <AddLocationAltIcon />
          </div>
          <div
            className='addStop__heading'
          >
            Add Location
          </div>
        </div>
        <form className={`addStop__form ${addingLocation ? '' : 'hidden'}`}>
          <input
            className='addStop__input'
            value={reqLocation}
            onChange={handleAddFormChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            ref={inputRef}
            placeholder='Enter Location Name'
          />
        </form>
      </div>
      {stops.length > 0 ? (
        <div className='StopInfo__container'>
          {stops.map((stop) => (
            <div key={stop.markerId} className='StopInfo'>
              <PlaceInfo key={stop.markerId} stop={stop} stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} />
            </div>
          ))}
        </div>
      ) :
        (
          <div className='SidePanel__filler'>
            <p>or</p>
            <h2>Click on the map!</h2>
          </div>
        )}
    </div>
  )
}

export default SidePanel