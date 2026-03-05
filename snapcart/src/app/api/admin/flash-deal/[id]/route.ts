import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import FlashDeal from "@/models/flashDeal.model";
import { auth } from "@/auth";
import "@/models/grocery.model";

/* ======================
   ✅ GET SINGLE FLASH DEAL
====================== */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDb();

    const { id } = await params;

    const flashDeal = await FlashDeal.findById(id).populate("products");

    if (!flashDeal) {
      return NextResponse.json(
        { message: "Flash deal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(flashDeal);
  } catch (error) {
    console.error("GET FLASH DEAL ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch flash deal" },
      { status: 500 }
    );
  }
}

/* ======================
   ✅ UPDATE FLASH DEAL (PUT)
====================== */
export const PUT = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDb();

    const session = req.auth;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await req.json();
    const { title, startTime, endTime, products } = body;

    if (!title || !startTime || !endTime || !products || products.length === 0) {
      return NextResponse.json(
        { message: "Title, start time, end time, and at least one product are required" },
        { status: 400 }
      );
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }

    const existingDeal = await FlashDeal.findById(id);

    if (!existingDeal) {
      return NextResponse.json(
        { message: "Flash deal not found" },
        { status: 404 }
      );
    }

    const updatedDeal = await FlashDeal.findByIdAndUpdate(
      id,
      {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        products,
      },
      { new: true }
    ).populate("products");

    return NextResponse.json({
      success: true,
      message: "Flash deal updated successfully",
      flashDeal: updatedDeal,
    });

  } catch (error) {
    console.error("UPDATE FLASH DEAL ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
});

/* ======================
   ✅ DELETE FLASH DEAL
====================== */
export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDb();

    const session = req.auth;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingDeal = await FlashDeal.findById(id);

    if (!existingDeal) {
      return NextResponse.json(
        { message: "Flash deal not found" },
        { status: 404 }
      );
    }

    await FlashDeal.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Flash deal deleted successfully",
    });

  } catch (error) {
    console.error("DELETE FLASH DEAL ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
});