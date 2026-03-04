import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },

  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },

  discountValue: {
    type: Number,
    required: true,
  },

  minOrderAmount: {
    type: Number,
    default: 0,
  },

  expiryDate: Date,

  usageLimit: {
    type: Number,
    default: 1,
  },

  usedCount: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

}, { timestamps: true });

export default mongoose.models.Coupon ||
mongoose.model("Coupon", couponSchema);