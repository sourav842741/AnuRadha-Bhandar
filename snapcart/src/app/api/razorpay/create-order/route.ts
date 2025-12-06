// src/app/api/razorpay/create-order/route.ts
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // quick checks (only for debugging — remove later)
    console.log("RAZORPAY_KEY_ID present:", Boolean(process.env.RAZORPAY_KEY_ID));
    console.log("RAZORPAY_KEY_SECRET present:", Boolean(process.env.RAZORPAY_KEY_SECRET));

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: "Missing RAZORPAY env variables on server" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: body.amount, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
