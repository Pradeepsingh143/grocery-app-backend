import express from "express";
const router = express.Router();
import { contactController } from "../controllers/contact.controller.js";

router.post("/", contactController);

export default router;
