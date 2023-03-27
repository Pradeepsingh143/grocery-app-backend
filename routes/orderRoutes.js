import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create", isLoggedIn, createOrder);

export default router;
