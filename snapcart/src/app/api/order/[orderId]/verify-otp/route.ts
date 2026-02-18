import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb();

    // ✅ FIX: params is Promise in Next.js 15
    const { orderId } = await context.params;

    const { otp } = await req.json();

    if (!orderId || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "orderId and OTP are required",
        },
        { status: 400 }
      );
    }

    const order: any = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.deliveryOtp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // ✔ Mark order as delivered
    order.status = "delivered";
    order.deliveryOtpVerified = true;
    order.deliveredAt = new Date();
    await order.save();

    // 🔥 Complete assignment
    await DeliveryAssignment.updateOne(
      { order: orderId },
      { $set: { assignedTo: null, status: "completed" } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Delivery Completed Successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
