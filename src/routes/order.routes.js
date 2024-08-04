import express from "express";
const router = express.Router();
import {
  createOrder,
  getAllOrders,
  editOrder,
  deleteOrder,
  searchOrders,
  filterOrdersByStatus,
  getSalesData,
} from "../controllers/order.controller.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware.js";

router.post("/new-order", verifyToken, createOrder);
router.get("/all", verifyToken, verifyAdmin, getAllOrders);
router.put("/edit/:orderId", verifyToken, verifyAdmin, editOrder);
router.delete("/delete/:orderId", verifyToken, verifyAdmin, deleteOrder);
router.get("/search", verifyToken, verifyAdmin, searchOrders);
router.get("/status/:status", filterOrdersByStatus);
router.get("/sales-data", getSalesData);

export default router;
