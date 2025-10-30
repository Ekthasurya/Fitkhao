import Order from "../models/Order.js";

/** Place order (from user) */
export const placeOrder = async (req, res) => {
  try {
    const { userId, kitchenId, items, mealType, peopleCount, address, location } = req.body;
    if (!userId || !kitchenId || !items || !mealType) return res.status(400).json({ message: "Missing required fields" });

    const totalPrice = items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0);

    const order = new Order({
      userId, kitchenId, items, totalPrice, mealType, peopleCount: peopleCount || 1, address, location
    });

    await order.save();
    res.status(201).json({ message: "Order placed", orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Get order details */
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("userId kitchenId deliveryBoyId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
