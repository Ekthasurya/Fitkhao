import express from "express";
import {
  registerKitchen,
  loginKitchen,
  getOrders,
  markOrderReady,
  assignDelivery,
  getStats,
  getHistory
} from "../controllers/kitchenController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerKitchen);
router.post("/login", loginKitchen);

// protected kitchen routes (you can set authMiddleware('kitchen') to enforce)
router.get("/:kitchenId/orders", getOrders);
router.patch("/order/:orderId/ready", markOrderReady);
router.patch("/order/:orderId/assign", assignDelivery);
router.get("/:kitchenId/stats", getStats);
router.post("/:kitchenId/history", getHistory);

export default router;
