import jwt from "jsonwebtoken";
import Kitchen from "../models/Kitchen.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

export const authMiddleware = (role = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: "No token provided" });
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return res.status(401).json({ message: "Invalid token" });

      // role can be "kitchen" or "delivery" — we attach entity to req
      if (role === "kitchen") {
        const kitchen = await Kitchen.findById(decoded.id);
        if (!kitchen) return res.status(401).json({ message: "Unauthorized kitchen" });
        req.kitchen = kitchen;
      } else if (role === "delivery") {
        const delivery = await DeliveryBoy.findById(decoded.id);
        if (!delivery) return res.status(401).json({ message: "Unauthorized delivery boy" });
        req.delivery = delivery;
      } else {
        // generic / user endpoints can be open or implement user tokens in the future
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Auth failed", error: err.message });
    }
  };
};
