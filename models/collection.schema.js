import mongoose from "mongoose";

const { Schema, model } = mongoose;

const collectionSchema = Schema({
  name: {
    type: String,
    required: [true, "Please provide a category name"],
    trim: true,
    maxLength: [130, "collection name should not be more than 130 characters"],
  },
  photo: {
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
});

export default model("collection", collectionSchema);
