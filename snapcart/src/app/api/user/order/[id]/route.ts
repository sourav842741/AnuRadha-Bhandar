import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import Grocery from "@/models/grocery.model"; // ✅ IMPORTANT


export async function GET(
 req:NextRequest,
 context:{params:Promise<{id:string}>}
){

 try{

  await connectDb();

  const {id} = await context.params;


  if(!mongoose.Types.ObjectId.isValid(id)){

   return NextResponse.json({
    success:false,
    message:"Invalid user ID"
   },{status:400})

  }


  const orders = await Order.find({

   user:new mongoose.Types.ObjectId(id)

  })
  .populate("items.product") // ✅ now works
  .sort({createdAt:-1})


  return NextResponse.json({

   success:true,
   orders

  })

 }
 catch(error:any){

  console.log("Fetch Orders Error:",error)

  return NextResponse.json({

   success:false,
   message:error.message

  },{status:500})

 }

}