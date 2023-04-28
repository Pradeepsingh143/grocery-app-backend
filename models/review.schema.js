import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productReviewSchema = Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "order",
      require: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
  },
  {
    timestamps: true,
  }
);

export default model("review", productReviewSchema);
