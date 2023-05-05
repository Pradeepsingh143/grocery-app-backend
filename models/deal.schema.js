import { model, Schema } from "mongoose";

const dealSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: ["please provide product id", 405],
  },
  name: String,
  description: String,
  discount: {
    type: Number,
    required: ["please provide discount in number 0-100", 405]
  },
  expiryDate: {
    type: Date,
    required: ["expiry date is required", 405]
  },
});

export default model("deal", dealSchema);
