import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextResponse } from "next/server";

export async function PATCH(
 req: Request,
 { params }: { params: Promise<{ id: string }> }
){

 const { id } = await params;

 const body = await req.json();

 console.log("Updating:", id);
 console.log("Data:", body);

 await connectDB();

 const updated = await Grocery.findByIdAndUpdate(
 id,
 body,
 { new:true }
 );

 return NextResponse.json(updated);

}