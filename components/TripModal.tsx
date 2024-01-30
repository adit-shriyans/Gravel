import React, { useState, MouseEvent, ChangeEvent, useEffect, useRef } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import '@styles/css/TripModal.css';

interface ModalPropsType {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    tripId: string;
}

const TripModal = ({ setShowModal, tripId }: ModalPropsType) => {
    const [tripName, setTripName] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    const handleSaveClick = async (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        // console.log(tripName);
        setShowModal(false);
        
        try {
            const res = await fetch(`/api/trip/${tripId}`, {
                method: 'GET'
            });
            const trip = await res.json();
            console.log(trip);

            const response = await fetch(`/api/trip/${tripId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: tripName,
                    status: trip.status,
                }),
            });
        } catch (error) {
            console.log(error);
        }
    }

    const handleCancelClick = (e: MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowModal(false);
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        e.stopPropagation();
        setTripName(e.target.value);
    }

    useEffect(() => {
        const handleOutsideClick = (e: any): void => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setShowModal(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [setShowModal]);


    return (
        <div className='TripModal__overlay'>
            <div className='TripModal' ref={modalRef}>
                <div>
                    Name your Trip!
                </div>
                <input
                    placeholder='Trip Name'
                    className='TripModal__input'
                    value={tripName}
                    onChange={handleInputChange}
                />
                <div className='TripModal__btns'>
                    <div className='TripModal__save' onClick={handleSaveClick}>
                        <CheckIcon />
                        Save
                    </div>
                    <div className='TripModal__cancel' onClick={handleCancelClick}>
                        <CloseIcon />
                        Cancel
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TripModal;
