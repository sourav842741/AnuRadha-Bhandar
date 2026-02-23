import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";


// ==========================
// 🟢 CREATE ORDER
// ==========================
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

    product:new mongoose.Types.ObjectId(item._id), // ✅ FIXED

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


  return NextResponse.json({

   success:true,

   message:"Order created successfully",

   order:newOrder

  },{status:201});


 }
 catch(error:any){

  console.log("Create Order Error:",error);

  return NextResponse.json({

   success:false,

   message:"Server error"

  },{status:500});

 }

}


// ==========================
// 🟢 GET USER ORDERS
// ==========================
export async function GET(
 req:NextRequest,
 context:{params:Promise<{id:string}>}
){

 try{

  await connectDb();

  const {id} = await context.params;


  if(!mongoose.Types.ObjectId.isValid(id)){

   return NextResponse.json(
    {success:false,message:"Invalid user ID"},
    {status:400}
   );

  }


  const orders = await Order.find({

   user:new mongoose.Types.ObjectId(id)

  })
  .populate("items.product")
  .populate("assignedDeliveryBoy")
  .sort({createdAt:-1});


  return NextResponse.json({

   success:true,

   orders

  });


 }
 catch(error:any){

  console.log("Error fetching orders:",error);

  return NextResponse.json({

   success:false,

   message:"Server error"

  },{status:500});

 }

}