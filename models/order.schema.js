import mongoose from "mongoose";
const { Schema, model } = mongoose;
import OrderStatus from "../utils/orderStatus.js";
import PaymentStatus from "../utils/paymentStatus.js";
import PaymentMethod from "../utils/paymentMethod.js";
import crypto from "crypto";

const orderSchema = Schema(
  {
    orderId: {
      type: String,
      unique: true ,
    },
    product: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
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
    paymentStatus: {
      type: String,
      emun: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      emun: Object.values(PaymentMethod),
      default: PaymentMethod.COD,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus), // [PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
      default: OrderStatus.PLACED,
    },
    tracking: [{ type: mongoose.Schema.Types.ObjectId, ref: "orderTracking" }],
    coupon: String,
    transactionId: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (!this.isNew) {
    return next();
  }
  const date = new Date().toISOString().slice(0, 10).split("-").join("");
  const hash = crypto.randomBytes(5).toString('hex');
  this.orderId = date + hash;
  next();
});

export default model("order", orderSchema);
