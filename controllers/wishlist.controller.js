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
  const wishlist = await Wishlist.findOne({ userId: userId });
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
  const { items: wishlistItems } = req.body;

  if (!wishlistItems) {
    throw new CustomError("wishlist Items not found", 404);
  }

  const userExistingWishlist = await Wishlist.findOne({ userId: userId });

  if (!userExistingWishlist) {
    const wishlist = await Wishlist.create({
      userId: userId,
      items: wishlistItems,
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
    let itemAlreadyInWishlist = false;
    let updateWishlist = await userExistingWishlist.items.map((item) => {
      const foundedItem = wishlistItems.find(
        (wishlistItem) =>
          wishlistItem.productId.toString() === item.productId.toString()
      );

      if (foundedItem) {
        itemAlreadyInWishlist: true
      }
      return item;
    });

    let addNewItem = wishlistItems.filter(
      (wishlistItem) =>
        !userExistingWishlist.items
          .map((item) => item.productId.toString())
          .includes(wishlistItem.productId.toString())
    );

    updateWishlist = updateWishlist.concat(
      addNewItem.map((wishlistItem) => {
        return {
          productId: wishlistItem.productId,
        };
      })
    );

    userExistingWishlist.items = updateWishlist;
    const updatedWishlist = await userExistingWishlist.save();
    if (itemAlreadyInWishlist) {
      res.status(200).json({
        success: true,
        message: "item already added in your wishlist",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "wishlist successfully updated",
        updatedWishlist,
      });
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
    { "items._id": itemId },
    { $pull: { items: { _id: itemId } } },
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
