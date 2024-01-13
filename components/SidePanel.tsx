'use client';

import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import '@styles/css/SidePanel.css'
import PlaceInfo from './PlaceInfo';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import totalDistImg from '../assets/totalDistance.png';
import { v4 as uuid } from 'uuid';
import Image from 'next/image';
import { MarkerLocation } from '@assets/types/types';

interface SPPropsType {
  stops: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
  coord: L.LatLngTuple;
}

function compareDates(dateString1: string, dateString2: string): number {
  const [day1, month1, year1] = dateString1.split('/').map(Number);
  const [day2, month2, year2] = dateString2.split('/').map(Number);

  const date1 = new Date(year1 + 2000, month1 - 1, day1);
  const date2 = new Date(year2 + 2000, month2 - 1, day2);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    console.error("Invalid date strings");
    return 0;
  }

  if (date1 < date2) {
    return -1;
  } else if (date1 > date2) {
    return 1;
  } else {
    return 0;
  }
}

function getNumberOfDays(startDateStr: string, endDateStr: string): number {
  const [day1, month1, year1] = startDateStr.split('/').map(Number);
  const [day2, month2, year2] = endDateStr.split('/').map(Number);

  const startDate = new Date(year1 + 2000, month1 - 1, day1);
  const endDate = new Date(year2 + 2000, month2 - 1, day2);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("Invalid date strings");
    return 0;
  }
  const timeDifference = endDate.getTime() - startDate.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return Math.floor(daysDifference);
}

function calculateDistance(coord1: L.LatLngTuple, coord2: L.LatLngTuple) {
  const R = 6371;

  const lat1 = toRadians(coord1[0]);
  const lon1 = toRadians(coord1[1]);
  const lat2 = toRadians(coord2[0]);
  const lon2 = toRadians(coord2[1]);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

const SidePanel = ({ stops, setStops, setZoomLocation, coord }: SPPropsType) => {
  const [scrolled, setScrolled] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);
  const [addCoords, setAddCoords] = useState<L.LatLngTuple | []>([]);
  const [reqLocation, setReqLocation] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [tripDates, setTripDates] = useState<string[]>(['07/01/24', '07/01/24']);
  const [noOfDays, setNoOfDays] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let dist = 0;
    let sDate = stops[0].startDate;
    let eDate = stops[stops.length-1].endDate; 
    if(sDate && eDate) setTripDates([sDate, eDate]);
    for(let i = 0; i < stops.length; i++) {
      if(stops[i].startDate !== undefined && compareDates(stops[i].startDate!, tripDates[0]) === -1) setTripDates([stops[i].startDate!, tripDates[1]])
      if(stops[i].endDate !== undefined && compareDates(stops[i].endDate!, tripDates[1]) === 1) setTripDates([tripDates[0], stops[i].endDate!])
      if(i === 0) dist += parseFloat(calculateDistance(stops[i].location, coord).toFixed(2))
      else dist += parseFloat(calculateDistance(stops[i].location, stops[i-1].location).toFixed(2))
    }
    setTotalDistance(parseFloat(dist.toFixed(2)));
    setNoOfDays(getNumberOfDays(tripDates[0], tripDates[1]));
  }, [stops])

  useEffect(() => {
    if(addingLocation) {
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
          if (data.length > 0) {
            const location = data[0];
            const latitude = location.lat;
            const longitude = location.lon;
            setAddCoords([latitude, longitude])
          } else {
            console.error(`Geocoding failed for ${reqLocation}`);
          }
        })
        .catch(error => console.error('Error fetching geocoding data', error));
    }
    else {
      console.log("req empty str");
    }
  }, [reqLocation])

  const markNewLocation = ([latitude, longitude]: L.LatLngTuple) => {
    const newStop: MarkerLocation = { markerId: uuid(), location: [latitude, longitude], locationName: reqLocation }
    setStops([newStop, ...stops]);
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