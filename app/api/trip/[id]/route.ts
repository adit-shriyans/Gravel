import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@utils/database';
import Stop from '@models/stop';

// GET
export const GET = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();

        const prompt = await Stop.findById(params.id).populate('creator');
        if (!prompt) return new Response("Prompt not found", { status: 404 });
        return new Response(JSON.stringify(prompt), {
            status: 200
        });
    } catch (error) {
        return new Response("Failed to fetch all prompts", { status: 500 });
    }
}

// PATCH
export const PATCH = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        
        const existingPrompt = await Stop.findById(params.id);

        if (!existingPrompt) return new Response("Prompt not found", { status: 404 });

        const requestBody = JSON.parse(request.body);
        const { prompt, tag } = requestBody;

        existingPrompt.prompt = prompt;
        existingPrompt.tag = tag;

        await existingPrompt.save();

        return new Response(JSON.stringify(existingPrompt), { status: 200 });
    } catch (error) {
        return new Response("Failed to update prompt", { status: 500 });
    }
}

// DELETE
export const DELETE = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        await Stop.findByIdAndDelete(params.id);

        return new Response("Prompt deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete prompt", { status: 500 });
    }
}
