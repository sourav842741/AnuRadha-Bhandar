import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";

export async function GET() {

  await connectDb();

  const banners = await Banner.find().sort({ createdAt: -1 });

  return NextResponse.json(banners);
}

export async function POST(req: Request) {

  await connectDb();

  const body = await req.json();

  const banner = await Banner.create(body);

  return NextResponse.json(banner);

}