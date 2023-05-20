import Review from "../models/review.schema.js";
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

  if (!(productId && rating && orderId && message)) {
    throw new CustomError("All fields are required", 401)
  }

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
     throw new CustomError("You already submited an review for this order", 405);
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


/***********************************************************
 * @getReview
 * @Route http://localhost:4000/api/review/get/id
 * @description get reviews by productId
 * @parameter productId, rating, message
 * @returns success message, review object
 ***********************************************************/
export const getReviewById = asyncHandler(async(req, res)=>{
    const {id: productId} = req.params;

    try {
      const reviews = await Review.find({productId: productId}, "rating message user createdAt").populate("user", "-_id name")
      return res.status(200).json({
        success: true,
        message: "review fetched successfully",
        reviews
      })
    } catch (error) {
      console.log(error);
      throw new CustomError(error.message || "something went wrong while getting reviews by product")
    }
})