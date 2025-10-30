import express from "express";
import { placeOrder, getOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", placeOrder);
router.get("/:orderId", getOrder);

export default router;
