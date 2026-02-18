import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { sendMail } from "@/lib/mailer";

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb();

    // ✅ FIX: params is Promise in Next.js 15
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId required" },
        { status: 400 }
      );
    }

    const order: any = await Order.findById(orderId).populate("user");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.user?.email) {
      return NextResponse.json(
        { success: false, message: "User email not found" },
        { status: 400 }
      );
    }

    // 🔐 Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    order.deliveryOtp = otp;
    await order.save();

    await sendMail(
      order.user.email,
      "Your Delivery OTP",
      `<h2>Your Delivery OTP is <strong>${otp}</strong></h2>`
    );

    return NextResponse.json(
      { success: true, message: "OTP sent to email" },
      { status: 200 }
    );

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
