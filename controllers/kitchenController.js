import Kitchen from "../models/Kitchen.js";
import Order from "../models/Order.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findNearestDeliveryBoy } from "../utils/assignDelivery.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

/** Register kitchen */
export const registerKitchen = async (req, res) => {
  try {
    const { locationId, password, name, address } = req.body;
    if (!locationId || !password) return res.status(400).json({ message: "locationId and password required" });
    const exists = await Kitchen.findOne({ locationId });
    if (exists) return res.status(400).json({ message: "locationId exists" });
    const kitchen = new Kitchen({ locationId, password, name, address });
    await kitchen.save();
    res.status(201).json({ message: "Kitchen registered", kitchenId: kitchen._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Login kitchen -> return token */
export const loginKitchen = async (req, res) => {
  try {
    const { locationId, password } = req.body;
    const kitchen = await Kitchen.findOne({ locationId });
    if (!kitchen) return res.status(404).json({ message: "Kitchen not found" });
    const match = await bcrypt.compare(password, kitchen.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: kitchen._id, type: "kitchen" }, process.env.JWT_SECRET);
    res.json({ message: "Login success", token, kitchenId: kitchen._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Get orders (with optional filters: status, mealType, startDate, endDate) */
export const getOrders = async (req, res) => {
  try {
    const { kitchenId } = req.params;
    const { status, mealType, startDate, endDate } = req.query;
    const filter = { kitchenId };
    if (status) filter.status = status;
    if (mealType) filter.mealType = mealType;
    if (startDate || endDate) {
      filter.orderTime = {};
      if (startDate) filter.orderTime.$gte = new Date(startDate);
      if (endDate) filter.orderTime.$lte = new Date(endDate);
    }
    const orders = await Order.find(filter).sort({ orderTime: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Mark order ready by kitchen */
export const markOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(orderId, { status: "ready" }, { new: true });
    res.json({ message: "Order marked ready", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Helper function to find nearest available delivery boy */
// const findNearestDeliveryBoy = async () => {
//   // For testing, this can be a simple "find first available"
//   // In real use, you'd calculate distance based on coordinates
//   return await DeliveryBoy.findOne({ available: true });
// };

export const assignDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1️⃣ Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Find an available delivery boy
    const deliveryBoy = await findNearestDeliveryBoy();
    if (!deliveryBoy) {
      return res.status(404).json({ message: "No delivery boy available" });
    }

    // 3️⃣ Assign order to delivery boy
    order.deliveryBoyId = deliveryBoy._id;
    order.status = "onDelivery";
    await order.save();

    // 4️⃣ Update delivery boy's status
    deliveryBoy.available = false;
    if (!deliveryBoy.assignedOrders) deliveryBoy.assignedOrders = [];
    deliveryBoy.assignedOrders.push(order._id);
    await deliveryBoy.save();

    // 5️⃣ Send response
    res.json({
      message: "Order assigned to delivery boy successfully",
      orderId: order._id,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        phone: deliveryBoy.phone
      }
    });
  } catch (err) {
    console.error("Error assigning delivery boy:", err);
    res.status(500).json({ message: err.message });
  }
};

/** Assign delivery boy (nearest available) */
// export const assignDelivery = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     // find nearest available delivery boy
//     const deliveryBoy = await findNearestDeliveryBoy();
//     if (!deliveryBoy) return res.status(404).json({ message: "No delivery boy available" });

//     order.deliveryBoyId = deliveryBoy._id;
//     order.status = "onDelivery";
//     await order.save();

//     deliveryBoy.available = false;
//     deliveryBoy.assignedOrders.push(order._id);
//     await deliveryBoy.save();

//     res.json({ message: "Assigned to delivery boy", order, deliveryBoyId: deliveryBoy._id });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

/** Stats counts */
export const getStats = async (req, res) => {
  try {
    const { kitchenId } = req.params;
    const total = await Order.countDocuments({ kitchenId });
    const pending = await Order.countDocuments({ kitchenId, status: "pending" });
    const ready = await Order.countDocuments({ kitchenId, status: "ready" });
    const onDelivery = await Order.countDocuments({ kitchenId, status: "onDelivery" });
    const completed = await Order.countDocuments({ kitchenId, status: "completed" });
    const breakfast = await Order.countDocuments({ kitchenId, mealType: "breakfast" });
    const lunch = await Order.countDocuments({ kitchenId, mealType: "lunch" });
    const dinner = await Order.countDocuments({ kitchenId, mealType: "dinner" });

    res.json({ total, pending, ready, onDelivery, completed, breakfast, lunch, dinner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Order history between datetimes (body: startDate, endDate) */
export const getHistory = async (req, res) => {
  try {
    const { kitchenId } = req.params;
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ message: "startDate and endDate required" });
    const orders = await Order.find({
      kitchenId,
      orderTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ orderTime: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
