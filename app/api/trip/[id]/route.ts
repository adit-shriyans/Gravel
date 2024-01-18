import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@utils/database';
import Stop from '@models/stop';

// GET
export const GET = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();

        const trip = await Stop.findById(params.id).populate('Trip');
        if (!trip) return new Response("Trip not found", { status: 404 });
        return new Response(JSON.stringify(trip), {
            status: 200
        });
    } catch (error) {
        return new Response("Failed to fetch trip", { status: 500 });
    }
}

// DELETE
export const DELETE = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        await Stop.findByIdAndDelete(params.id);

        return new Response("Trip deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete trip", { status: 500 });
    }
}
