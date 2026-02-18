import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { emitSocketEvent } from "@/lib/emitSocketEvent";

export async function POST(req: Request) {
  try {
    await connectDb();

    const body = await req.json();
    const { userId, items, totalAmount, paymentMethod, address } = body;

    // ✅ Validation
    if (!userId || !items?.length || !paymentMethod || !address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 }
      );
    }

    // ✅ Create Order
    const newOrder: any = await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      items: items.map((item: any) => ({
        product: new mongoose.Types.ObjectId(item.product),
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount,
      paymentMethod,
      address,
      status: "pending", // good practice to define default
    });

    // ✅ Push order into user's myOrders
    await User.findByIdAndUpdate(userId, {
      $push: { myOrders: newOrder._id },
    });

    // Optional populate (currently no delivery boy at creation)
    await newOrder.populate("user", "name email");

    // 🔥 Real-time emit to admin panel
    await emitSocketEvent("new-order", {
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
      paymentMethod: newOrder.paymentMethod,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: newOrder,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating order:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
