import express from "express";
import { createDeal } from "../controllers/deal.controller.js";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";
const router = express.Router();

router.post("/create", isLoggedIn, authorize([AuthRoles.ADMIN]), createDeal);

export default router;