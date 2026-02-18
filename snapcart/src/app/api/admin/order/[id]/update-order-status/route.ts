import { emitSocketEvent } from "@/lib/emitSocketEvent";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX: params is Promise in Next.js 15
    const { id } = await context.params;

    const { status } = await req.json();

    // Load order + user socket ID
    const order: any = await Order.findById(id).populate(
      "user",
      "socketId name email"
    );

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 400 }
      );
    }

    order.status = status;

    let deliveryBoysPayload: any[] = [];

    // ⭐ OUT FOR DELIVERY LOGIC
    if (status === "out of delivery" && !order.assignment) {
      const { longitude, latitude } = order.address;

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b: any) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id: any) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b: any) => !busyIdSet.has(String(b._id))
      );

      const candidates = availableBoys.map((b: any) => b._id);

      // ❌ No delivery boys available
      if (candidates.length === 0) {
        await order.save();

        if (order.user?.socketId) {
          await emitSocketEvent(
            "order-status-updated",
            {
              orderId: order._id,
              status,
            },
            order.user.socketId
          );
        }

        return NextResponse.json({
          message: "Order updated but no delivery boys available",
        });
      }

      // ✅ Create assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      // 🔥 Broadcast to delivery boys
      for (const boyId of candidates) {
        const boy: any = await User.findById(boyId);

        if (boy?.socketId) {
          await emitSocketEvent(
            "delivery-assignment",
            {
              assignmentId: deliveryAssignment._id,
              order: deliveryAssignment.order,
            },
            boy.socketId
          );
        }
      }

      order.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      order.assignment = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map((b: any) => ({
        id: b._id,
        name: b.name,
        longitude: b.location?.coordinates?.[0],
        latitude: b.location?.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
    }

    // ✅ Save order
    await order.save();

    await order.populate("assignedDeliveryBoy", "name email mobile");
    await order.populate("user");

    // ⭐ REAL-TIME UPDATE USER
    if (order.user?.socketId) {
      await emitSocketEvent(
        "order-status-updated",
        {
          orderId: order._id,
          status,
          assignedDeliveryBoy: order.assignedDeliveryBoy || null,
        },
        order.user.socketId
      );
    }

    return NextResponse.json(
      {
        assignedDeliveryBoy: order.assignedDeliveryBoy,
        availableBoys: deliveryBoysPayload,
        assignment: order.assignment?._id || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order status error:", error);

    return NextResponse.json(
      { message: `Order status error: ${error}` },
      { status: 500 }
    );
  }
}
