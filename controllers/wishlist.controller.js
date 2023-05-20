import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import Wishlist from "../models/wishlist.schema.js";

/***********************************************************
 * @getUserWishlist
 * @Route http://localhost:4000/api/wishlist/delete
 * @description delete user wishlist
 * @parameter userId from req
 * @returns success message
 ***********************************************************/
export const getUserWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const wishlist = await Wishlist.findOne({ userId: userId }, "items").populate("items.productId", " _id price previewImage name collectionId");
  res.status(200).json({
    success: true,
    message: "user wishlist fetched successfully",
    wishlist,
  });
});

/***********************************************************
 * @addToWishlist
 * @Route http://localhost:4000/api/wishlist/add
 * @description add wishlist items
 * @parameter user id from req wishlist items
 * @returns success message, wishlist object
 ***********************************************************/
export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    throw new CustomError("productId not founded", 404);
  }

  const userExistingWishlist = await Wishlist.findOne({ userId: userId });

  if (!userExistingWishlist) {
    const wishlist = await Wishlist.create({
      userId: userId,
      items: [{
        productId
      }],
    });

    if (!wishlist) {
      throw new CustomError("something went wrong", 400);
    }

    res.status(200).json({
      success: true,
      message: "wishlist created successfully",
      wishlist,
    });
  } else {
    const itemAlreadyExist = userExistingWishlist.items.find((item)=> item.productId.toString() === productId.toString())
    if (!itemAlreadyExist) {
      const addedWishlist = userExistingWishlist.items.concat({productId: productId});
      userExistingWishlist.items = addedWishlist
      const updatedWishlist = await userExistingWishlist.save({ new: true })
      res.status(200).json({
        message: "item added",
        updatedWishlist
      })
    } else {
      res.status(200).json({
        message: "item already exist in wishlist"
      })
    }
  }
});

/***********************************************************
 * @removeWishlistItem
 * @Route http://localhost:4000/api/wishlist/remove/:productId
 * @description remove item from wishlist
 * @parameter product id
 * @returns success message, wishlist object
 ***********************************************************/
export const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId: itemId } = req.params;
  const wishlist = await Wishlist.findOneAndUpdate(
    { "items.productId": itemId },
    { $pull: { items: { productId: itemId } } },
    { new: true }
  );

  if (!wishlist) {
    throw new CustomError("wishlist item not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "wishlist item deleted successfully",
    wishlist,
  });
});

/***********************************************************
 * @deleteWishlist
 * @Route http://localhost:4000/api/wishlist/delete
 * @description delete user wishlist
 * @parameter userId from req
 * @returns success message
 ***********************************************************/
export const deleteWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Wishlist.findOneAndDelete({ userId: userId });
  res.status(200).json({
    success: true,
    message: "user wishlist deleted successfully",
  });
});
