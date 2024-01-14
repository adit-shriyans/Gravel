export type TripType = {
    _id: string;
    stops: MarkerLocation[];
    status: "completed" | "ongoing" | "upcoming"; 
}

export type MarkerLocation = {
    markerId: string,
    location: L.LatLngTuple,
    locationName: string,
    startDate?: string,
    endDate?: string,
    notes?: string
}

export type VoidFunctionType = () => void;

