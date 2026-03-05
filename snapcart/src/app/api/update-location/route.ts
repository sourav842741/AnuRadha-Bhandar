import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDb();

  const { userId, location, address } = await req.json();

  if (!userId || !location) {
    return NextResponse.json(
      { error: "Missing userId or location" },
      { status: 400 }
    );
  }

  // Build update object
  const updateData: { location: any; address?: any } = { location };
  
  // If address is provided, include it in the update
  if (address) {
    updateData.address = address;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true }
  );

  return NextResponse.json({
    success: true,
    location: user.location,
    address: user.address,
  });
}
