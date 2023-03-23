import mongoose from "mongoose";

const { Schema, model } = mongoose;

const wishlistSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("wishlist", wishlistSchema)