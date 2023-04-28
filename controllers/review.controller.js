import Review from "../models/review.schema.js";
import Product from "../models/product.schema.js";
import Order from "../models/order.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import mongoose from "mongoose";
import OrderStatus from "../utils/orderStatus.js";

/***********************************************************
 * @addReview
 * @Route http://localhost:4000/api/review/add
 * @description add review
 * @parameter productId, rating, message
 * @returns success message, review object
 ***********************************************************/

export const addReview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, rating, orderId, message } = req.body;

  const order = await Order.findOne({
    'product.productId': mongoose.Types.ObjectId(productId),
    orderId: orderId,
    user: mongoose.Types.ObjectId(userId),
    orderStatus: OrderStatus.DELIVERED
  }).select("_id orderId")

  if (!order) {
    throw new CustomError("You are not authroise user to submit review", 403);
  }

  const review = await Review.findOne({
    product: mongoose.Types.ObjectId(productId),
    user: mongoose.Types.ObjectId(userId),
    orderId: mongoose.Types.ObjectId(order._id)
  }).select("_id rating message")

  if (review) {
     throw new CustomError("You already submited an review", 405);
  }

  try {
    const review = await Review.create({
      productId,
      user: userId,
      orderId: order._id,
      rating,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(
      error.message || "review not created someThing went wrong",
      500
    );
  }
});
