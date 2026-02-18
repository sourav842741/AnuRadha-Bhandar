import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb();

    // ✅ FIX: params is Promise
    const { orderId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const order: any = await Order.findById(orderId)
      .populate("assignedDeliveryBoy", "name mobile location")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const addressLocation = {
      latitude: Number(order.address?.latitude),
      longitude: Number(order.address?.longitude),
    };

    return NextResponse.json(
      {
        success: true,
        order: {
          _id: order._id,
          status: order.status,
          totalAmount: order.totalAmount,

          address: {
            ...order.address,
            latitude: addressLocation.latitude,
            longitude: addressLocation.longitude,
          },

          assignedDeliveryBoy: order.assignedDeliveryBoy
            ? {
                name: order.assignedDeliveryBoy.name,
                mobile: order.assignedDeliveryBoy.mobile,
                location: order.assignedDeliveryBoy.location || null,
              }
            : null,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Track order API error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
