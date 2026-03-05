import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import Grocery from "@/models/grocery.model";

export async function GET(req: Request) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const orders = await Order.find({ user: userId }).populate("items.product");

  let categories: string[] = [];

  orders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      if (item.product?.category) {
        categories.push(item.product.category);
      }
    });
  });

  const products = await Grocery.find({
    category: { $in: categories },
  }).limit(6);

  return NextResponse.json(products);
}