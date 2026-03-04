import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";

// UPDATE BANNER
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    const body = await req.json();
    const { id } = await params;

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      {
        title: body.title,
        minOrderAmount: body.minOrderAmount,
        discountText: body.discountText,
        image: body.image,
        isActive: body.isActive,
      },
      { new: true }
    );

    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE BANNER
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    const { id } = await params;

    await Banner.findByIdAndDelete(id);

    return NextResponse.json({ message: "Banner deleted" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}