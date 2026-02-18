import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb();

    // ✅ FIX: params is Promise in Next.js 15
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order: any = await Order.findById(orderId)
      .populate("assignedDeliveryBoy");

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        address: {
          latitude: order.address?.latitude,
          longitude: order.address?.longitude,
          fullAddress: order.address?.fullAddress,
        },
        order,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Fetch order error:", error);

    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    );
  }
}
