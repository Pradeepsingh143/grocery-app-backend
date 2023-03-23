import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
 getUserProfile, updateProfile
} from "../controllers/profile.controller.js";


router.put("/update", isLoggedIn, updateProfile);
router.get("/get", isLoggedIn, getUserProfile);

export default router;