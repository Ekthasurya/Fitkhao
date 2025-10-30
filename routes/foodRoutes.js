import express from "express";
import { addFood, getAllFoods, getFoodByBMI, deleteFood } from "../controllers/foodController.js";

const router = express.Router();

// Admin - add/delete/get
router.post("/add", addFood);
router.get("/all", getAllFoods);
router.delete("/:id", deleteFood);

// Public - suggestions by bmi
router.get("/suggestions", getFoodByBMI);

export default router;
