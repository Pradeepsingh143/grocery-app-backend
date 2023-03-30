import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contactSchema = Schema({
  name: {
    type: String,
    required: ["Name is required", true],
    trim: true,
  },
  email: {
    type: String,
    required: ["Email is required", true],
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  message: {
    type: String,
    required: ["message reuqired", true],
  },
});

export default model("contact", contactSchema);
