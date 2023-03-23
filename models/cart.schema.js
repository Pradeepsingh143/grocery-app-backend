import mongoose from "mongoose";
const { Schema, model } = mongoose;

const cartSchema = Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
}, {
    timestamps: true
});

export default model("cart", cartSchema);
