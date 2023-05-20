import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { addReview, getReviewById } from "../controllers/review.controller.js";


router.post("/add", isLoggedIn, addReview);
router.get("/get/:id", getReviewById);

export default router;
