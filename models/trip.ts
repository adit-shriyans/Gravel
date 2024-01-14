import { Schema, model, models } from "mongoose";

const TripSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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

const Trip = models.User || model("User", TripSchema);

export default Trip;