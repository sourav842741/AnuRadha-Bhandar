import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    // ✅ FIX: params is Promise in Next.js 15
    const { id } = await context.params;

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Find assignment
    const assignment: any = await DeliveryAssignment.findById(id);

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // ✅ Ensure it's still broadcasted
    if (assignment.status !== "brodcasted") {
      return NextResponse.json(
        { message: "Assignment is no longer available to reject" },
        { status: 400 }
      );
    }

    // ✅ Remove delivery boy ID from broadcast list
    assignment.brodcastedTo = assignment.brodcastedTo.filter(
      (boyId: any) => boyId.toString() !== session.user.id
    );

    // Optional logic if no delivery boys left
    if (assignment.brodcastedTo.length === 0) {
      assignment.status = "brodcasted"; 
      // You can also mark as "expired" if needed
    }

    await assignment.save();

    return NextResponse.json(
      { message: "Assignment rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject assignment error:", error);

    return NextResponse.json(
      { message: `Reject order error: ${error}` },
      { status: 500 }
    );
  }
}
