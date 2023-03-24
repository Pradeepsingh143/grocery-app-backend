import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  getUserWishlist,
  addToWishlist,
  removeWishlistItem,
  deleteWishlist,
} from "../controllers/wishlist.controller.js";

router.get("/get", isLoggedIn, getUserWishlist);
router.post("/add", isLoggedIn, addToWishlist);
router.put("/remove/:productId", isLoggedIn, removeWishlistItem);
router.delete("/delete", isLoggedIn, deleteWishlist);

export default router;
