import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Coupon from "@/models/coupon.model";

/* ======================
   UPDATE FULL COUPON
====================== */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const { id } = await context.params; // ✅ FIX
  const body = await req.json();

  const updated = await Coupon.findByIdAndUpdate(
    id,
    body,
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { message: "Coupon not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

/* ======================
   DELETE COUPON
====================== */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const { id } = await context.params; // ✅ FIX

  await Coupon.findByIdAndDelete(id);

  return NextResponse.json({ message: "Deleted" });
}

/* ======================
   TOGGLE ACTIVE STATUS
====================== */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const { id } = await context.params; // ✅ FIX

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return NextResponse.json(
      { message: "Coupon not found" },
      { status: 404 }
    );
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return NextResponse.json(coupon);
}