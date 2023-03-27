import express from "express";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  cancelOrder,
  getOrderList,
  getAllOrderList,
  changeOrderStatus,
} from "../controllers/order.controller.js";
import AuthRoles from "../utils/authRoles.js";

const router = express.Router();

router.post("/create", isLoggedIn, createOrder);
router.get("/user", isLoggedIn, getOrderList);
router.get("/all", getAllOrderList);
router.put("/cancel/:orderId", isLoggedIn, cancelOrder);
router.put("/status/:orderId", isLoggedIn, authorize([AuthRoles.ADMIN, AuthRoles.MODERATOR]), changeOrderStatus)

export default router;
