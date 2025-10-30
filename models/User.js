import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String,
  address: String,
  location: { lat: Number, lng: Number },
  dob: Date,
  height: Number, // cm
  weight: Number, // kg
  workoutType: String,
  bmi: Number,
  bmiStatus: { type: String, enum: ["low", "medium", "good"] },
  bodyType: String,
  workoutRegularly: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
