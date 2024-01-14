import { Schema, model, models } from "mongoose";

const LatLngSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
});

const StopSchema = new Schema({
    trip: {
        type: Schema.Types.ObjectId,
        ref: "Trip",
        required: true,
    },
    id: {
        type: String,
        unique: [true, 'Stop Id should be unique'],
        required: [true, 'Stop Id is required'],
    },
    location: {
        type: LatLngSchema,
        required: [true, 'Location coordinates are required']
    },
    locationName: {
        type: String,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    notes: {
        type: String,
    },
});

const Stop = models.Stop || model("Stop", StopSchema);

export default Stop;
