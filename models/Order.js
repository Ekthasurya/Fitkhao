import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  kitchenId: { type: mongoose.Schema.Types.ObjectId, ref: "Kitchen", required: true },
  deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy", default: null },
  items: [{ name: String, qty: Number, price: Number }],
  totalPrice: { type: Number, default: 0 },
  mealType: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
  peopleCount: { type: Number, default: 1 }, // Surya + 7 -> peopleCount=8
  orderTime: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "ready", "onDelivery", "completed"], default: "pending" },
  address: String,
  location: { lat: Number, lng: Number }
});

export default mongoose.model("Order", orderSchema);
