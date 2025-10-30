import mongoose from "mongoose";
import bcrypt from "bcrypt";

const deliverySchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  phone: String,
  available: { type: Boolean, default: false },
  currentLocation: { lat: Number, lng: Number },
  punchInTime: Date,
  punchOutTime: Date,
  distance: { type: Number, default: 0 }, // optional: distance from kitchen (km)
  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  createdAt: { type: Date, default: Date.now }
});

deliverySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("DeliveryBoy", deliverySchema);
