import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import Grocery from "@/models/grocery.model";

export async function GET(req: Request) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const orders = await Order.find({
    "items.product": productId,
  });

  let ids: string[] = [];

  orders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const id = item.product.toString();

      if (id !== productId) {
        ids.push(id);
      }
    });
  });

  const products = await Grocery.find({
    _id: { $in: ids },
  }).limit(4);

  return NextResponse.json(products);
}