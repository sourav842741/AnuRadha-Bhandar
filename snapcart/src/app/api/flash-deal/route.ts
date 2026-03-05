import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import FlashDeal from "@/models/flashDeal.model";
import "@/models/grocery.model"; // model register

export async function GET() {
  try {
    await connectDb();

    const now = new Date();

    const activeDeals = await FlashDeal.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate("products")
      .sort({ createdAt: -1 });

    return NextResponse.json(activeDeals);

  } catch (error) {
    console.error("GET ACTIVE FLASH DEALS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch flash deals" },
      { status: 500 }
    );
  }
}