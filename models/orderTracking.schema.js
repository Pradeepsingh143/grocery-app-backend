import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderTrackingSchema = Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order", 
        required: true
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default model("orderTracking", orderTrackingSchema)