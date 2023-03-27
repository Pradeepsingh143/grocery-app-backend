import express from "express";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getProductByCollectionId,
} from "../controllers/product.controller.js";
import AuthRoles from "../utils/authRoles.js";
const router = express.Router();

router.post("/create", isLoggedIn, authorize([AuthRoles.ADMIN]), addProduct);
router.put("/update/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), updateProduct);
router.delete("/delete/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), deleteProduct);
router.get("/get/:id", getProductById);
router.get("/get", getAllProducts);
router.get("/collection/:id", getProductByCollectionId);


export default router;
