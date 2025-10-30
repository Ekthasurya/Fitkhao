import User from "../models/User.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { calculateBMI } from "../utils/bmiCalculator.js";
import Food from "../models/Food.js";

/**
 * For simplicity we store OTP in memory map.
 * For production use Redis with TTL or a separate collection.
 */
// OTP store


// Generate & send
const otpStore = new Map(); // temporary in-memory storage

// 🔢 Generate a 6-digit random OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// 📤 Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const otp = generateOTP();
    const expiresAt = Date.now() + (parseInt(process.env.OTP_TTL_MINUTES || "10") * 60 * 1000);

    otpStore.set(phone, { otp, expiresAt });

    // Simulate sending (replace with SMS API in production)
    console.log(`✅ OTP for ${phone}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP are required" });

    const record = otpStore.get(phone);
    if (!record)
      return res.status(400).json({ message: "No OTP requested for this phone number" });

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified successfully
    otpStore.delete(phone);

    // Check if user exists, else create one
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    res.json({ message: "OTP verified successfully", userId: user._id });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const { userId, name, address, location, dob, height, weight, workoutType } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const bmiRes = (height && weight) ? calculateBMI(height, weight) : null;
    const updates = { name, address, location, dob, height, weight, workoutType };
    if (bmiRes) {
      updates.bmi = bmiRes.bmi;
      updates.bmiStatus = bmiRes.status;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, upsert: true });
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMoreInfo = async (req, res) => {
  try {
    const { userId, workoutRegularly, bodyType } = req.body;

    const workoutBool =
      workoutRegularly === "Yes" || workoutRegularly === "true" || workoutRegularly === true;

    const user = await User.findByIdAndUpdate(
      userId,
      { workoutRegularly: workoutBool, bodyType },
      { new: true, upsert: true } // ✅ auto-create if user doesn't exist
    );

    res.json({ message: "Info updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getFoodSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.bmiStatus) return res.status(400).json({ message: "Complete profile with BMI first" });
    const foods = await Food.find({ bmiCategory: user.bmiStatus });
    res.json({ bmiStatus: user.bmiStatus, suggestions: foods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
