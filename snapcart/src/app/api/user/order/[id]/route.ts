import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import "@/models/grocery.model"; // register product model

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    const { id } = await context.params;

    // Validate User ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // Fetch Orders + Delivery Boy Details
    const orders = await Order.find({
      user: new mongoose.Types.ObjectId(id),
    })
      .populate("items.product") // Product details
      .populate("assignedDeliveryBoy", "name mobile email location") // ⭐ Delivery Boy Details
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.log("Fetch Orders Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}