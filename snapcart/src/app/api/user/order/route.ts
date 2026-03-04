import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { emitSocketEvent } from "@/lib/emitSocketEvent";
import Coupon from "@/models/coupon.model";

export async function POST(req: Request) {

 try{

  await connectDb();

  const body = await req.json();

const { userId, items, totalAmount, paymentMethod, address, couponCode } = body;

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

  // ✅ Coupon usage decrease AFTER order created
if (couponCode) {

  const coupon = await Coupon.findOne({ code: couponCode });

  if (coupon) {

    // 🔒 Re-validation (important)
    if (!coupon.isActive) {
      throw new Error("Coupon is inactive");
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new Error("Coupon expired");
    }

    if (coupon.usageLimit <= 0) {
      throw new Error("Coupon usage limit reached");
    }

    // ✅ Decrease usage count
    await Coupon.updateOne(
      { _id: coupon._id },
      { $inc: { usageLimit: -1 } }
    );
  }
}


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