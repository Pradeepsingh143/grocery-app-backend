import mongoose from "mongoose";
const { Schema, model } = mongoose;

const couponSchema = Schema(
  {
    code: {
      type: String,
      required: [true, "please provide coupon name"],
      unique: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product"
    },
    discount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true
  }
);

export default model("coupon", couponSchema)