import express from "express";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  getAllCollections,
} from "../controllers/collection.controller.js";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";

const router = express.Router();

router.post("/create", isLoggedIn, authorize([AuthRoles.ADMIN]), createCollection);
router.put("/update/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), updateCollection);
router.delete("/delete/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), deleteCollection);
router.get("/get", getAllCollections);

export default router;
