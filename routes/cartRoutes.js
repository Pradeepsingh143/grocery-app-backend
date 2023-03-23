import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { getCart, addToCart, removeCartItem, deleteCart } from "../controllers/cart.controller.js";

router.get("/get", isLoggedIn, getCart);
router.post("/add", isLoggedIn, addToCart);
router.put("/remove/:productId", isLoggedIn, removeCartItem);
router.delete("/delete", isLoggedIn, deleteCart);

export default router;
