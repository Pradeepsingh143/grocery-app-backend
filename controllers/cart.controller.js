import Cart from "../models/cart.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";

/***********************************************************
 * @getCart
 * @Route http://localhost:4000/api/cart/get
 * @description get cart items
 * @parameter user id from req
 * @returns success message, cart object
 ***********************************************************/
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.find({ userId: userId }).populate({
    path: "items.productId",
    select: "name price shortDescription previewImage collectionId",
    populate: {
      path: "collectionId",
      select: "name",
    },
  });

  if (!cart) {
    new CustomError("cart not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "cart sucessfully fetched",
    cart,
  });
});

/***********************************************************
 * @addToCart
 * @Route http://localhost:4000/api/cart/add
 * @description add cart items
 * @parameter user id from req
 * @returns success message, cart object
 ***********************************************************/
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cartItems } = req.body;

  if (!cartItems) {
    throw new CustomError("cart Items not found", 404);
  }

  const existingCart = await Cart.findOne({ userId: userId });

  if (!existingCart) {
    const cart = await Cart.create({
      userId: userId,
      items: cartItems,
    });

    if (!cart) {
      throw new CustomError("something went wrong", 400);
    }

    res.status(200).json({
      success: true,
      message: "cart successfully fetched",
      cart,
    });
  } else {
    // Check if existing cart already includes cartitems id
    let updatedItems = existingCart.items.map((item, index) => {
      const foundItem = cartItems.find(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString()
      );

      if (foundItem) {
        return { ...item, quantity: cartItems[index].quantity || 1 };
      }

      return item;
    });

    // If cart items id not found, add a new item to the cart
    let newItems = cartItems.filter(
      (cartItem) =>
        !existingCart.items
          .map((item) => item.productId.toString())
          .includes(cartItem.productId.toString())
    );

    updatedItems = updatedItems.concat(
      newItems.map((cartItem) => {
        return {
          productId: cartItem.productId,
          quantity: cartItem.quantity || 1,
        };
      })
    );

    existingCart.items = updatedItems;
    const updatedCart = await existingCart.save();

    res.status(200).json({
      success: true,
      message: "cart successfully updated",
      cart: updatedCart,
    });
  }
});

/***********************************************************
 * @removeCartItem
 * @Route http://localhost:4000/api/cart/remove/:productId
 * @description remove item from cart
 * @parameter product id
 * @returns success message, cart object
 ***********************************************************/
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ userId: req.user._id });
  console.log(cart);

  // remove cart item using filter method
  const updatedCartArray = cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );

  // update cart item
  cart.items = updatedCartArray;
  const updatedCart = await cart.save(); // save to db

  res.status(200).json({
    success: true,
    message: "cart item deleted successfully",
    updatedCart,
  });
});

/***********************************************************
 * @deleteCart
 * @Route http://localhost:4000/api/cart/delete
 * @description delete user cart
 * @parameter userId from req
 * @returns success message
 ***********************************************************/
export const deleteCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Cart.findOneAndDelete({ userId: userId });
  res.status(200).json({
    success: true,
    message: "cart deleted successfully",
  });
});
