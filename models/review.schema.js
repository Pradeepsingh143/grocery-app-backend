import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productReviewSchema = Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
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
