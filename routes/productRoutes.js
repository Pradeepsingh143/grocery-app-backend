import express from "express";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getProductByCollectionId,
  searchHandler,
  getFeaturedProducts,
  getBestDealOfWeek
} from "../controllers/product.controller.js";
import AuthRoles from "../utils/authRoles.js";
const router = express.Router();

router.post("/create", isLoggedIn, authorize([AuthRoles.ADMIN]), addProduct);
router.put("/update/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), updateProduct);
router.delete("/delete/:id", isLoggedIn, authorize([AuthRoles.ADMIN]), deleteProduct);
router.get("/get/:id", getProductById);
router.get("/get", getAllProducts);
router.get("/featured/get", getFeaturedProducts);
router.get("/deals/get", getBestDealOfWeek);
router.get("/collection/:id", getProductByCollectionId);
router.get("/search", searchHandler);


export default router;
