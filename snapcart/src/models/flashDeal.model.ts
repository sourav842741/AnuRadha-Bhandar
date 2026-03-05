import mongoose from "mongoose";

const flashDealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grocery",
      },
    ],
  },
  { timestamps: true }
);

const FlashDeal =
  mongoose.models.FlashDeal ||
  mongoose.model("FlashDeal", flashDealSchema);

export default FlashDeal;

