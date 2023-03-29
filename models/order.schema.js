import mongoose from "mongoose";
const { Schema, model } = mongoose;
import OrderStatus from "../utils/orderStatus.js";
import PaymentStatus from "../utils/paymentStatus.js";
import PaymentMethod from "../utils/paymentMethod.js";
import crypto from "crypto";
import Product from "../models/product.schema.js";
import CustomError from "../utils/customError.js";

const orderSchema = Schema(
  {
    orderId: {
      type: String,
      unique: true,
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
  const hash = crypto.randomBytes(5).toString("hex");
  this.orderId = date + hash;
  next();
});

orderSchema.methods = {
  updateStockAndSold: async function () {
    let updatedOrder = [];
    try {
      await Promise.all(
        await this.product.map(async (item) => {
          const product = await Product.findById(item.productId);

          if (!product) {
            throw new CustomError(
              `Product ${product.productId} not found`,
              404
            );
          } else if (product.stock < item.quantity) {
            throw new CustomError(
              `Stock not enough for product ${product._id}`,
              405
            );
          }

          let productObj = {
            productId: product._id,
            stock: product.stock,
            sold: product.sold,
          };
          updatedOrder.push(productObj);

          product.stock -= item.quantity;
          product.sold += item.quantity;

          await product.save();
        })
      );
    } catch (error) {
      console.log("updatedOrder", updatedOrder);
      updatedOrder.map(async (item) => {
        const product = await Product.findById(item.productId);
        product.stock = item.stock;
        product.sold = item.sold;
        await product.save();
      });
      throw new CustomError(error?.message, error?.code);
    }
  },
};

export default model("order", orderSchema);
