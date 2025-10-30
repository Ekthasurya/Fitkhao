import express from "express";
import {
  registerDeliveryBoy,
  loginDeliveryBoy,
  startShift,
  getAssigned,
  completeDelivery,
  endShift
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/register", registerDeliveryBoy);
router.post("/login", loginDeliveryBoy);

router.post("/:deliveryId/start", startShift);
router.get("/:deliveryId/assigned", getAssigned);
router.post("/:deliveryId/complete/:orderId", completeDelivery);
router.post("/:deliveryId/end", endShift);

export default router;
