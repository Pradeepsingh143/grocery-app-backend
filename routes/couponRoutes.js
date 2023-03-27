import express from "express";
import {addCoupon, deactivateCoupon, deleteCoupon, getAllCoupon, activateCoupon} from "../controllers/coupon.controller.js";
import {isLoggedIn, authorize} from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";
const router = express.Router();

router.post("/create", isLoggedIn, authorize([AuthRoles.ADMIN]), addCoupon);
router.put("/deactive/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), deactivateCoupon);
router.put("/activate/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), activateCoupon);
router.delete("/delete/:id",isLoggedIn, authorize([AuthRoles.ADMIN]), deleteCoupon);
router.get("/get",isLoggedIn, getAllCoupon);

export default router;