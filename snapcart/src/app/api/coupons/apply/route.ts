import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Coupon from "@/models/coupon.model";



export async function POST(req: Request) {
  try {
    await connectDb();

    const { code, cartTotal } = await req.json();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json(
        { message: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // ❌ Inactive
    if (!coupon.isActive) {
      return NextResponse.json(
        { message: "Coupon is not active" },
        { status: 400 }
      );
    }

    // ❌ Expired
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return NextResponse.json(
        { message: "Coupon expired" },
        { status: 400 }
      );
    }

    // ❌ Min order check
    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          message: `Minimum order ₹${coupon.minOrderAmount} required`,
        },
        { status: 400 }
      );
    }

    // ❌ Usage limit check
    if (coupon.usageLimit <= 0) {
      return NextResponse.json(
        { message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // ✅ Calculate discount
    // ✅ Calculate discount safely
let discountAmount =
  (cartTotal * coupon.discountValue) / 100;

// ❗ Discount should never exceed cart total
if (discountAmount > cartTotal) {
  discountAmount = cartTotal;
}

const finalAmount = cartTotal - discountAmount;

   return NextResponse.json({
  discountAmount,
  finalAmount,
  minOrderAmount: coupon.minOrderAmount,   // ✅ IMPORTANT
  message: "Coupon applied successfully",
});

  } catch (error) {
    console.error("Apply coupon error:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}