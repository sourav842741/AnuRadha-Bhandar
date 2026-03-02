import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;

    const category = formData.get("category") as string;

    const unit = formData.get("unit") as string;

    const price = formData.get("price") as string;

    /* ✅ IMPORTANT */
    const mrp = formData.get("mrp") as string;

    const file = formData.get("file") as Blob | null;

    let imageUrl: string | null = "";

    if (file) {
      imageUrl = await uploadOnCloudinary(file);
    }

    const grocery = await Grocery.create({
      name,
      category,
      unit,
      price,
      mrp, // ✅ THIS WAS MISSING
      image: imageUrl,
    });

    return NextResponse.json(grocery, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `add grocery error ${error}` },
      { status: 500 },
    );
  }
}
