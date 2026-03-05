import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import Grocery from "@/models/grocery.model";

export async function GET() {
  await connectDb();

  const orders = await Order.find({}, "items.product items.quantity");

  const productCount: Record<string, number> = {};

  orders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const id = item.product.toString();

      productCount[id] =
        (productCount[id] || 0) + (item.quantity || 1);
    });
  });

  const sorted = Object.entries(productCount)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 6);

  const ids = sorted.map((item: any) => item[0]);

  const products = await Grocery.find({ _id: { $in: ids } });

  return NextResponse.json(products);
}