import mongoose, { Schema, model, models } from "mongoose";

const TripSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Trip Name is required'],
    },
    status: {
        type: ["pending", "confirmed", "completed", "cancelled"],
        required: [true, 'Status is required'],
    },
})

const Trip = models.Trip || model("Trip", TripSchema);

export default Trip;