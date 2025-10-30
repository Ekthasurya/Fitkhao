import express from "express";
import {
  sendOTP,
  verifyOTP,
  updateProfile,
  addMoreInfo,
  getFoodSuggestions
} from "../controllers/userController.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/profile", updateProfile); // include userId in body
router.post("/add-info", addMoreInfo);
router.get("/:userId/suggestions", getFoodSuggestions);

export default router;
