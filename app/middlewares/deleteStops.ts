import Stop from "@models/stop";
import { NextApiRequest, NextApiResponse } from "next";
import { NextFunction } from 'express';
import { NextRequest } from "next/server";

export const deleteStopsMiddleWare = async (req: Request | NextRequest, id: String, next: NextFunction) => {
    try {
        const stopsToDelete = await Stop.find({ trip: id });

        if(stopsToDelete.length)
            await Stop.deleteMany({ _id: { $in: stopsToDelete.map(stop => stop._id) }});
        next();
    }
    catch(error) {
        console.error(`Error deleting stops for trip ${id}`, error);
        next(error);
    }
}