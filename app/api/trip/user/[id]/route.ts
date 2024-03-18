import { connectToDB } from '@utils/database';
import Trip from '@models/trip';
import { NextRequest } from 'next/server';

export const GET = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        
        const trip = await Trip.find({user: params.id}).populate('user');
        if (!trip) return new Response("Trip not found", { status: 404 });
        return new Response(JSON.stringify(trip[0]), { status: 200 });        
    } catch (error) {
        return new Response("Failed to fetch trip", { status: 500 });
    }
}