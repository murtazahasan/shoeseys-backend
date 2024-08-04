import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  deleteProduct,
  updateProduct,
  searchProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

// Searching functionality for admin page
router.get("/", getAllProducts);

// Searching functionality for frontend UI/UX
router.get("/search", searchProducts);

router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
