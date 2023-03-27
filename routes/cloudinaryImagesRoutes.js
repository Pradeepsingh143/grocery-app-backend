import express from "express";
import {getAllImages, deleteImage, uploadImage} from "../controllers/images.cloudinary.js"
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";

const router = express.Router();

router.get("/get", isLoggedIn, authorize([AuthRoles.ADMIN]), getAllImages);
router.post("/post", isLoggedIn, authorize([AuthRoles.ADMIN]), uploadImage);
router.delete("/delete", isLoggedIn, authorize([AuthRoles.ADMIN]), deleteImage);


export default router;
