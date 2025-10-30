import Food from "../models/Food.js";

export const addFood = async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json({ message: "Food added", food });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFoodByBMI = async (req, res) => {
  try {
    const { bmiCategory } = req.query;
    if (!bmiCategory) return res.status(400).json({ message: "bmiCategory required" });
    const foods = await Food.find({ bmiCategory });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    await Food.findByIdAndDelete(id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
