'use client'

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import PlaceIcon from '@mui/icons-material/Place';
import distanceImg from '../assets/distance.png';
import HomeIcon from '@mui/icons-material/Home';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Image from 'next/image';
import UtilityDropDown from './UtilityDropDown';
import { MarkerLocation } from '@assets/types/types';
import { calculateDistance, getTodaysDate, isValidDate } from '@assets/CalcFunctions';

interface PIPropsType {
  stop: MarkerLocation;
  stops: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
}

const arraySize = 6;

const PlaceInfo = ({ stop, stops, setStops, setZoomLocation }: PIPropsType) => {
  const locationNameArr = stop.locationName.split(',');
  let name = locationNameArr[0];
  if (locationNameArr.length > 1) {
    name = name + `, ${locationNameArr[1]}`
  }
  const todaysDate = getTodaysDate();

  const [inputValues, setInputValues] = useState({
    locationName: stop.locationName,
    locationDist: 10,
    homeDist: 20,
    inDate: stop.startDate || getTodaysDate(),
    outDate: stop.endDate || getTodaysDate(),
    notesMsg: '',
  });

  const [editMode, setEditMode] = useState(Array(arraySize).fill(false));
  const [showErr, setShowErr] = useState(Array(arraySize).fill(false));
  const [errMsg, setErrMsg] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);

  const LNInputRef = useRef<HTMLInputElement | null>(null);
  const LDInputRef = useRef<HTMLInputElement | null>(null);
  const HDInputRef = useRef<HTMLInputElement | null>(null);
  const IDInputRef = useRef<HTMLInputElement | null>(null);
  const ODInputRef = useRef<HTMLInputElement | null>(null);
  const NotesInputRef = useRef<HTMLInputElement | null>(null);

  const updateStop = async () => {
    try {
      const { locationName, inDate, outDate, notesMsg } = inputValues;
  
      const response = await fetch(`/api/stop/${stop.markerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: stop.location,
          locationName,
          startDate: inDate,
          endDate: outDate,
          notes: notesMsg,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = (id: number) => {
    if (!editMode[id]) {
      let newEditMode = Array(arraySize).fill(false);
      newEditMode[id] = !editMode[id];
      setEditMode(newEditMode);
    }
  };

  const handleAddNotes = () => {
    setShowNotes(true);
    const newEditMode = editMode;
    newEditMode[5]=true;
    setEditMode(newEditMode);
    if (NotesInputRef.current) {
      NotesInputRef.current.focus();
    }
  }

  const handleDropdownClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setShowDropDown(() => (!showDropDown));
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrMsg('');
    setShowErr(Array(arraySize).fill(false));

    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };


  const handleInputBlur = () => {
    const {locationName, locationDist, homeDist, inDate, outDate, notesMsg} = inputValues

    if (locationName && locationDist && homeDist && inDate && outDate) {
      if (isValidDate(inDate) && isValidDate(outDate) && locationDist > 0 && homeDist > 0) {
        if (notesMsg === '')
          setShowNotes(false);
        setEditMode(Array(arraySize).fill(false));
      }
      else if (!isValidDate(inDate) || !isValidDate(outDate)) {
        setErrMsg("Date not in format DD/MM/YY");
        focusOnEmptyField();
      }
      else if (locationDist <= 0 || homeDist <= 0) {
        setErrMsg("Distance can't be negative or zero");
        focusOnEmptyField();
      }
    }
    else {
      setErrMsg("This field is required");
      focusOnEmptyField();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const {locationName, locationDist, homeDist, inDate, outDate, notesMsg} = inputValues
    if (e.key === 'Enter') {
      if (locationName && locationDist && homeDist && inDate && outDate) {
        if (isValidDate(inDate) && isValidDate(outDate) && locationDist > 0 && homeDist > 0) {
          if (notesMsg === '')
            setShowNotes(false);
          setEditMode(Array(arraySize).fill(false));
        }
        else if (!isValidDate(inDate) || !isValidDate(outDate)) {
          e.preventDefault();
          setErrMsg("Date not in format DD/MM/YY");
          focusOnEmptyField();
        }
        else if (locationDist <= 0 || homeDist <= 0) {
          e.preventDefault();
          setErrMsg("Distance can't be negative or zero");
          focusOnEmptyField();
        }
      }
      else {
        e.preventDefault();
        setErrMsg("Can't leave field empty");
        focusOnEmptyField();
      }
    }
  };

  const focusOnEmptyField = () => {
    if (editMode[0] && LNInputRef.current) {
      LNInputRef.current.focus();
      setShowErr([true, false, false, false, false])
    }
    else if (editMode[1] && LDInputRef.current) {
      LDInputRef.current.focus();
      setShowErr([false, true, false, false, false])
    }
    else if (editMode[2] && HDInputRef.current) {
      HDInputRef.current.focus();
      setShowErr([false, false, true, false, false])
    }
    else if (editMode[3] && IDInputRef.current) {
      IDInputRef.current.focus();
      setShowErr([false, false, false, true, false])
    }
    else if (editMode[4] && ODInputRef.current) {
      ODInputRef.current.focus();
      setShowErr([false, false, false, false, true])
    }
  };

  const setDists = () => {
    let dist = 0;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (location) {
        const { latitude, longitude } = location.coords;
        dist = calculateDistance(stop.location, [latitude, longitude]);
        setInputValues((prev) => ({
          ...prev,
          homeDist: dist
        }))
        const index = stops.indexOf(stop);
        if (index === 0) 
          setInputValues((prev) => ({
            ...prev,
            locationDist: dist
          }));
      }, function () {
        console.log('Could not get position');
      });
    }

    const index = stops.indexOf(stop);
    if (index > 0) {
      const dist2 = calculateDistance(stop.location, stops[index - 1].location);
      setInputValues((prev) => ({
        ...prev,
        locationDist: dist2
      }));
    }
  }

  useEffect(() => {
    if (editMode[0] && LNInputRef.current) {
      LNInputRef.current.focus();
    }
    else if (editMode[1] && LDInputRef.current) {
      LDInputRef.current.focus();
    }
    else if (editMode[2] && HDInputRef.current) {
      HDInputRef.current.focus();
    }
    else if (editMode[3] && IDInputRef.current) {
      IDInputRef.current.focus();
    }
    else if (editMode[4] && ODInputRef.current) {
      ODInputRef.current.focus();
    }
    else if (editMode[5] && NotesInputRef.current) {
      NotesInputRef.current.focus();
    }
  }, [editMode]);

  useEffect(() => {
    const newStops = stops.map((place) => {
      if (place.markerId === stop.markerId) {
        place.locationName = inputValues.locationName;
      }
      return place;
    });
    setStops(newStops);
  }, [inputValues.locationName])

  useEffect(() => {
    updateStop();
    const locationNameArr = stop.locationName.split(',');
    let newName = locationNameArr[0];
    if (locationNameArr.length > 1) {
      newName = newName + `, ${locationNameArr[1]}`
    }
    setInputValues((prev) => ({
      ...prev,
      locationName: newName
    }));
    setDists();
  }, [stop.location])

  useEffect(() => {
    updateStop();
    const newStops = stops.map((place) => {
      if(stop.markerId === place.markerId) {
        return {...place, startDate: inputValues.inDate, endDate: inputValues.outDate, notes: inputValues.notesMsg}
      }
      return place;
    })
    setStops(newStops)
  }, [inputValues.inDate, inputValues.outDate, inputValues.notesMsg]);

  useEffect(() => {
    setDists();        
  }, []);

  return (
    <div className='PlaceInfo' onClick={() => { setZoomLocation(stop.location) }}>
      <div
        className='PlaceInfo__dropdownbtn-container'
        tabIndex={0}
        onFocusCapture={() => setShowDropDown(true)}
        onBlurCapture={() => setShowDropDown(false)}
      >
        {showDropDown ?
          (
            <div className='PlaceInfo__dropdown-container'>
              <ExpandLessIcon
                className='PlaceInfo__dropdownbtn'
                onClick={(e) => (handleDropdownClick(e))}
              />
              <UtilityDropDown setStops={setStops} setZoomLocation={setZoomLocation} stop={stop} stops={stops} setShowDropDown={setShowDropDown} handleAddNotes={handleAddNotes} />
            </div>
          ) :
          (
            <ExpandMoreIcon
              className='PlaceInfo__dropdownbtn PlaceInfo__dropdownbtnop'
              onClick={(e) => (handleDropdownClick(e))}
            />
          )
        }
      </div>
      <div className='PlaceInfo__info'>
        <div className='PlaceInfo__img-container'>
          <PlaceIcon className='PlaceInfo__img' />
        </div>
        <div className={`ErrorPopUp ${showErr[0] && errMsg ? '' : 'hidden'}`}>
          {errMsg}
        </div>
        <div
          className='PlaceInfo__name PlaceInfo__content'
          onClick={() => handleClick(0)}
        >
          {editMode[0] ? (
            <form className='PlaceInfo__form'>
              <input
                className='PlaceInfo__input'
                type='text'
                value={inputValues.locationName}
                placeholder='Location Name'
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                ref={LNInputRef}
                name='locationName'
              />
            </form>
          ) : (
            `${inputValues.locationName}`
          )}
        </div>
      </div>
      <div className='PlaceInfo__DateInfo'>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <TodayIcon className='PlaceInfo__img' />
          </div>
          <div className={`ErrorPopUp ${showErr[3] && errMsg ? '' : 'hidden'}`}>
            {errMsg}
          </div>
          <div
            className='PlaceInfo__indate PlaceInfo__date PlaceInfo__content'
            onClick={() => handleClick(3)}
          >
            {editMode[3] ? (
              <form className='PlaceInfo__form'>
                <input
                  className='PlaceInfo__input PlaceInfo__input-date'
                  type='text'
                  value={inputValues.inDate}
                  placeholder='Check-In Date'
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  ref={IDInputRef}
                  name="inDate"
                />
              </form>
            ) : (
              `${inputValues.inDate}`
            )}
          </div>
        </div>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <EventIcon className='PlaceInfo__img' />
          </div>
          <div className={`ErrorPopUp ${showErr[4] && errMsg ? '' : 'hidden'}`}>
            {errMsg}
          </div>
          <div
            className='PlaceInfo__outdate PlaceInfo__date PlaceInfo__content'
            onClick={() => handleClick(4)}
          >
            {editMode[4] ? (
              <form className='PlaceInfo__form'>
                <input
                  className='PlaceInfo__input PlaceInfo__input-date'
                  type='text'
                  value={inputValues.outDate}
                  placeholder='Check-Out Date'
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  ref={ODInputRef}
                  name="outDate"
                />
              </form>
            ) : (
              `${inputValues.outDate}`
            )}
          </div>
        </div>
      </div>
      <div className='PlaceInfo__DistInfo'>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <Image
              src={distanceImg}
              alt='distance image'
              className='PlaceInfo__img PlaceInfo__img-distance'
            />
          </div>
          <div className={`ErrorPopUp ${showErr[1] && errMsg ? '' : 'hidden'}`}>
            {errMsg}
          </div>
          <div
            className='PlaceInfo__prevdist PlaceInfo__dist PlaceInfo__content'
            onClick={() => handleClick(1)}
          >
            {editMode[1] ? (
              <form className='PlaceInfo__form'>
                <input
                  className='PlaceInfo__input PlaceInfo__input-dist'
                  type='text'
                  value={inputValues.locationDist}
                  placeholder='Distance (in km)'
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  ref={LDInputRef}
                  name="locationDist"
                />
              </form>
            ) : (
              `${inputValues.locationDist}km`
            )}
          </div>
        </div>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <HomeIcon className='PlaceInfo__img PlaceInfo__img-distance' />
          </div>
          <div className={`ErrorPopUp ${showErr[2] && errMsg ? '' : 'hidden'}`}>
            {errMsg}
          </div>
          <div
            className='PlaceInfo__prevdist PlaceInfo__dist PlaceInfo__content'
            onClick={() => handleClick(2)}
          >
            {editMode[2] ? (
              <form className='PlaceInfo__form'>
                <input
                  className='PlaceInfo__input PlaceInfo__input-dist'
                  type='text'
                  value={inputValues.homeDist}
                  placeholder='Distance to Home (in km)'
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  ref={HDInputRef}
                  name="homeDist"
                />
              </form>
            ) : (
              `${inputValues.homeDist}km`
            )}
          </div>
        </div>
      </div>
      <div className={`PlaceInfo__info ${showNotes ? '' : 'hidden'}`}>
        <div className='PlaceInfo__img-container'>
          <EditNoteIcon />
        </div>
        <div
          className='PlaceInfo__notes PlaceInfo__content'
          onClick={() => handleClick(5)}
        >
          {editMode[5] ? (
            <form className='PlaceInfo__form'>
              <input
                className='PlaceInfo__input'
                type='text'
                value={inputValues.notesMsg}
                placeholder='Add notes'
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                ref={NotesInputRef}
                name="notesMsg"
              />
            </form>
          ) : (
            `${inputValues.notesMsg}`
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceInfo;