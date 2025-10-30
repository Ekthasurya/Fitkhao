import DeliveryBoy from "../models/DeliveryBoy.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";

/** Register delivery boy */
export const registerDeliveryBoy = async (req, res) => {
  try {
    const { employeeId, password, name, phone, distance } = req.body;
    if (!employeeId || !password) return res.status(400).json({ message: "employeeId and password required" });
    const exists = await DeliveryBoy.findOne({ employeeId });
    if (exists) return res.status(400).json({ message: "employeeId exists" });
    const dboy = new DeliveryBoy({ employeeId, password, name, phone, distance });
    await dboy.save();
    res.status(201).json({ message: "Delivery boy registered", deliveryId: dboy._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Login delivery boy */
export const loginDeliveryBoy = async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const dboy = await DeliveryBoy.findOne({ employeeId });
    if (!dboy) return res.status(404).json({ message: "Not found" });
    const match = await bcrypt.compare(password, dboy.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: dboy._id, type: "delivery" }, process.env.JWT_SECRET);
    res.json({ message: "Login success", token, deliveryId: dboy._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Start delivery shift (punch in) */
export const startShift = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId) {
      return res.status(400).json({ message: "Delivery ID is required" });
    }

    // Check if the delivery boy exists
    const dboy = await DeliveryBoy.findById(deliveryId);
    if (!dboy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    // If already available, prevent duplicate punch-in
    if (dboy.available) {
      return res.status(400).json({ message: "Shift already started" });
    }

    // Update shift status
    dboy.available = true;
    dboy.punchInTime = new Date();
    dboy.punchOutTime = null; // reset previous punch-out if any

    await dboy.save();

    res.json({ message: "Shift started successfully", dboy });
  } catch (err) {
    console.error("Start shift error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/** Get assigned deliveries */
export const getAssigned = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const dboy = await DeliveryBoy.findById(deliveryId);
    if (!dboy) return res.status(404).json({ message: "Delivery boy not found" });
    const orders = await Order.find({ deliveryBoyId: deliveryId }).sort({ orderTime: -1 });
    res.json({ assignedOrders: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Complete delivery for orderId */
export const completeDelivery = async (req, res) => {
  try {
    const { deliveryId, orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.deliveryBoyId) !== deliveryId) return res.status(403).json({ message: "Not assigned to this delivery boy" });

    order.status = "completed";
    await order.save();

    // mark delivery boy available again and add punchOutTime
    const dboy = await DeliveryBoy.findByIdAndUpdate(deliveryId, { available: true, punchOutTime: new Date() }, { new: true });
    res.json({ message: "Delivery completed", order, dboy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** End shift (punch out) */
export const endShift = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const dboy = await DeliveryBoy.findByIdAndUpdate(deliveryId, { available: false, punchOutTime: new Date() }, { new: true });
    res.json({ message: "Shift ended", dboy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
