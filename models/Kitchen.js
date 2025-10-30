import mongoose from "mongoose";
import bcrypt from "bcrypt";

const kitchenSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

kitchenSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Kitchen", kitchenSchema);
