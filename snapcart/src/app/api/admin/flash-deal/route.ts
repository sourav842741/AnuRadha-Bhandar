import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import FlashDeal from "@/models/flashDeal.model";
import { auth } from "@/auth";

/* ======================
   ✅ GET ALL FLASH DEALS
====================== */
export async function GET() {
  try {
    await connectDb();

    const flashDeals = await FlashDeal.find()
      .populate("products")
      .sort({ createdAt: -1 });

    return NextResponse.json(flashDeals);
  } catch (error) {
    console.error("GET FLASH DEALS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch flash deals" },
      { status: 500 }
    );
  }
}

/* ======================
   ✅ CREATE FLASH DEAL
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

    const { title, startTime, endTime, products } = body;

    if (!title || !startTime || !endTime || !products || products.length === 0) {
      return NextResponse.json(
        { message: "Title, start time, end time, and at least one product are required" },
        { status: 400 }
      );
    }

    const flashDeal = await FlashDeal.create({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      products,
    });

    // Populate products before returning
    await flashDeal.populate("products");

    return NextResponse.json(flashDeal);
  } catch (error) {
    console.error("CREATE FLASH DEAL ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
});

