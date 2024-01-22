import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@utils/database';
import Trip from '@models/trip';
import { StatusType } from '@assets/types/types';
import { deleteStopsMiddleWare } from '@app/middlewares/deleteStops';

interface TripRequestType {
    status: StatusType;
}

// GET
export const GET = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();

        const trip = await Trip.findById(params.id).populate('Trip');
        if (!trip) return new Response("Trip not found", { status: 404 });
        return new Response(JSON.stringify(trip), {
            status: 200
        });
    } catch (error) {
        return new Response("Failed to fetch trip", { status: 500 });
    }
}

export const PATCH = async (request: { json: () => PromiseLike<TripRequestType> | TripRequestType; }, { params }: { params: { id: string } }) => {
    const { status } = await request.json();

    try {
        await connectToDB();
        let existingTrip = await Trip.findById(params.id);

        if (!existingTrip) {
            return new Response("Stop not found", { status: 404 });
        }

        existingTrip.status = status;
        console.log(existingTrip, params.id, status);
        
        await existingTrip.save();

        return new Response(JSON.stringify(existingTrip), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to update stop", { status: 500 });
    }
};

// DELETE
export const DELETE = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    const {id} = params;
    try {
        await connectToDB();
        await deleteStopsMiddleWare(request, id, async () => {
            await Trip.findByIdAndDelete(id);
            return new Response("Trip and associated stops deleted successfully", { status: 200 });
        });
        return new Response("Trip and associated stops deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error while deleting trip", error);
        return new Response("Failed to delete trip", { status: 500 });
    }
};
