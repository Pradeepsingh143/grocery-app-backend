import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { contactController } from "../controllers/contact.controller.js";

router.post("/", isLoggedIn, contactController);

export default router;
