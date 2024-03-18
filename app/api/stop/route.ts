import { connectToDB } from '@utils/database';
import { NextApiRequest, NextApiResponse } from 'next';
import Stop from '@models/stop';
import { NextRequest } from 'next/server';

export const GET = async (request: Request | NextRequest) => {
    try{
        await connectToDB();

        const stops = await Stop.find({}).populate('trip');

        return new Response(JSON.stringify(stops), {
            status: 200
        })
    } catch(error) {
        return new Response("Failed to fetch all stops", {status: 500})
    }
}