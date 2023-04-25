import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { addReview } from "../controllers/review.controller.js";


router.post("/add", isLoggedIn, addReview);

export default router;
