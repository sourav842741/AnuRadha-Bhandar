import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { emitSocketEvent } from "@/lib/emitSocketEvent";

export async function POST(req: Request) {

 try{

  await connectDb();

  const body = await req.json();

  const { userId, items, totalAmount, paymentMethod, address } = body;


  if (!userId || !items?.length || !paymentMethod || !address) {

   return NextResponse.json(
    { success:false,message:"Missing required fields"},
    {status:400}
   );

  }


  if (!mongoose.Types.ObjectId.isValid(userId)) {

   return NextResponse.json(
    {success:false,message:"Invalid userId"},
    {status:400}
   );

  }


  const newOrder:any = await Order.create({

   user:new mongoose.Types.ObjectId(userId),

   items:items.map((item:any)=>({

    product:mongoose.Types.ObjectId.isValid(item._id)
     ? new mongoose.Types.ObjectId(item._id)
     : null,

    name:item.name,
    price:item.price,
    unit:item.unit,
    quantity:item.quantity,
    image:item.image

   })),

   totalAmount,

   paymentMethod,

   address,

   status:"pending"

  });


  await User.findByIdAndUpdate(userId,{
   $push:{myOrders:newOrder._id}
  });


  await newOrder.populate("user","name email");


  await emitSocketEvent("new-order",{

   orderId:newOrder._id,
   totalAmount:newOrder.totalAmount,
   paymentMethod:newOrder.paymentMethod

  });


  return NextResponse.json({

   success:true,
   message:"Order created successfully",
   order:newOrder

  },{status:201});

 }
 catch(error:any){

  console.log("Order Error:",error);

  return NextResponse.json({

   success:false,
   message:error.message

  },{status:500});

 }

}