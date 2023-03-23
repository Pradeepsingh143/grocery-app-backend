import mongoose from "mongoose";
const { Schema, model } = mongoose;
import OrderStatus from "../utils/orderStatus.js";

const orderSchema = Schema(
  {
    product: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
          },
          qty: Number,
          required: true,
        },
      ],
      reuqired: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: Number,
        required: true,
      },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    coupon: String,
    transactionId: String,
    status: {
      type: String,
      emum: Object.values(OrderStatus), // [ORDERED, SHIPPED, DELIVERED, CANCELLED]
      default: OrderStatus.ORDERED,
    },
    tracking: [{ type: mongoose.Types.ObjectId, ref: "orderTracking" }],
  },
  {
    timestamps: true,
  }
);

export default model("order", orderSchema);
