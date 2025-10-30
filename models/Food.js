import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
  category: { type: String, enum: ["veg", "non-veg"], default: "veg" },
  calories: { type: Number, required: true },
  bmiCategory: { type: String, enum: ["low", "medium", "good"], required: true },
  ingredients: [String],
  image: String,
  price: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Food", foodSchema);
