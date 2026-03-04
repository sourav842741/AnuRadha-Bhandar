import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Coupon from "@/models/coupon.model";
import { auth } from "@/auth";

/* ======================
   ✅ GET ALL COUPONS
====================== */
export async function GET() {
  try {
    await connectDb();

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

/* ======================
   ✅ CREATE COUPON
====================== */
export const POST = auth(async (req) => {
  try {
    await connectDb();

    const session = req.auth;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const couponData = {
      ...body,
      discountValue: Number(body.discountValue),
      minOrderAmount: Number(body.minOrderAmount) || 0,
      usageLimit: Number(body.usageLimit) || 1,
      expiryDate: body.expiryDate
        ? new Date(body.expiryDate)
        : null,
    };

    const coupon = await Coupon.create(couponData);

    return NextResponse.json(coupon);

  } catch (error) {
    console.error("COUPON ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
});