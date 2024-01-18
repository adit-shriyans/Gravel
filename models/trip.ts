import mongoose, { Schema, model, models } from "mongoose";

const TripSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    id:{
        type: String,
        unique: [true, 'Trip id already exists'],
        required: [true, 'Trip id is required'],
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
    },
})

const Trip = models.Trip || model("Trip", TripSchema);

export default Trip;