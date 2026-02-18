import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    // ✅ FIX: params is Promise in Next.js 15
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "deliveryBoyId required",
        },
        { status: 400 }
      );
    }

    // 🟢 Delivered orders only
    const deliveredOrders: any[] = await Order.find({
      assignedDeliveryBoy: id,
      deliveryOtpVerified: true,
    });

    const today = new Date();

    // -------------------------
    // TODAY EARNINGS
    // -------------------------
    const todayDelivered = deliveredOrders.filter(
      (order) =>
        order.deliveredAt &&
        new Date(order.deliveredAt).toDateString() ===
          today.toDateString()
    );

    const todayEarnings = todayDelivered.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // -------------------------
    // MONTHLY EARNINGS
    // -------------------------
    const month = today.getMonth();
    const year = today.getFullYear();

    const monthDelivered = deliveredOrders.filter(
      (order) =>
        order.deliveredAt &&
        new Date(order.deliveredAt).getMonth() === month &&
        new Date(order.deliveredAt).getFullYear() === year
    );

    const monthEarnings = monthDelivered.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // -------------------------
    // ALL TIME EARNINGS
    // -------------------------
    const allTimeEarnings = deliveredOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const earningsData = {
      today: {
        deliveredCount: todayDelivered.length,
        earnings: todayEarnings,
      },
      month: {
        deliveredCount: monthDelivered.length,
        earnings: monthEarnings,
      },
      allTime: {
        deliveredCount: deliveredOrders.length,
        earnings: allTimeEarnings,
      },
    };

    return NextResponse.json(
      { success: true, data: earningsData },
      { status: 200 }
    );
  } catch (err) {
    console.error("Earnings API Error:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
