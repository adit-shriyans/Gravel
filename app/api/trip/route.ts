import { connectToDB } from '@utils/database';
import { NextApiRequest, NextApiResponse } from 'next';
import Trip from '@models/trip';
import { NextRequest } from 'next/server';

export const GET = async (request: Request | NextRequest) => {
    try{
        await connectToDB();

        const trips = await Trip.find({}).populate('user');

        return new Response(JSON.stringify(trips), {
            status: 200
        })
    } catch(error) {
        return new Response("Failed to fetch all trips", {status: 500})
    }
}