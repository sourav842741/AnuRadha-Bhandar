import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    const hash = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const isValid = hash === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error("Verify Error:", error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
