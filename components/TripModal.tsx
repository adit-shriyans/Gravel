import React, { useState, MouseEvent, ChangeEvent, useEffect, useRef } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import '@styles/css/TripModal.css';

interface ModalPropsType {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    tripId: string;
}

type TripResponseType = {
    status: string,
    name: string
}

const TripModal = ({ setShowModal, tripId }: ModalPropsType) => {
    const [tripName, setTripName] = useState("");
    const [tripStatus, setTripStatus] = useState<String>('');
    const modalRef = useRef<HTMLDivElement>(null);

    const handleSaveClick = async (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (tripName) {
            setShowModal(false);

            try {
                const response = await fetch(`/api/trip/${tripId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: tripName,
                        status: tripStatus,
                    }),
                });
            } catch (error) {
                console.log(error);
            }
        }
        else {
            modalRef?.current?.focus();
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

    const fetchTripInfo = async (): Promise<TripResponseType> => {
        try {
            const res = await fetch(`/api/trip/${tripId}`, {
                method: 'GET'
            });
            const trip = await res.json();
            return {status:trip.status || '', name: trip.name || ''};
        } catch (err) {
            console.log("Error fetching trip info", err);
            return {status:'', name:''};
        }
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

    useEffect(() => {        
        const setTripInfo = async (): Promise<void> => {
            const tripInfo: TripResponseType = await fetchTripInfo();
            setTripStatus(tripInfo.status);
            setTripName(tripInfo.name);
        }
        setTripInfo();
    }, []);

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
