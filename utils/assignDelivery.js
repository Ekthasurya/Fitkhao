import DeliveryBoy from "../models/DeliveryBoy.js";

/**
 * Find nearest available delivery boy.
 * Here we use a simple field 'distance' on DeliveryBoy doc and select min distance.
 * Replace with real geo-based calculation later.
 */
export const findNearestDeliveryBoy = async () => {
  const d = await DeliveryBoy.find({ available: true }).sort({ distance: 1 }).limit(1);
  return d.length ? d[0] : null;
};
