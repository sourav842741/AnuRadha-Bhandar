import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import GroceryItemCard from "./GroceryItemCard";
import { auth } from "@/auth";
import Order from "@/models/order.model";
import User from "@/models/user.model";

export default async function UserDashboard() {

  await connectDb();

  // All products
  const groceryList = await Grocery.find({}).lean();

  // Logged User
  const session = await auth();

  let popularProducts:any[] = [];

  if(session?.user?.email){

    // Get DB User
    const dbUser = await User.findOne({
      email: session.user.email
    });

    if(dbUser){

      // User Orders
      const orders = await Order.find({
        user: dbUser._id
      }).lean();


      const countMap:any={};

      orders.forEach((order:any)=>{

        order.items?.forEach((item:any)=>{

          const id = item.product.toString();

          countMap[id] =
          (countMap[id] || 0) + item.quantity;

        });

      });


      // Sort Popular
      const popularIds = Object.entries(countMap)
      .sort((a:any,b:any)=>b[1]-a[1])
      .slice(0,8)
      .map((i:any)=>i[0]);


      popularProducts = groceryList.filter((item:any)=>
        popularIds.includes(item._id.toString())
      );

    }

  }


  // ✅ New User → Random Popular
  if(popularProducts.length===0){

    popularProducts = groceryList
    .sort(()=>0.5-Math.random())
    .slice(0,8);

  }


  // Categories
  const categories=[
    ...new Set(groceryList.map((item:any)=>item.category))
  ];


 return(
<>

<HeroSection/>

<CategorySlider/>


{/* ⭐ POPULAR PRODUCTS */}

<section className="w-[90%] md:w-[80%] mx-auto mt-10">

<h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">

⭐ Popular Items For You

</h2>


<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

{popularProducts.map((item:any)=>(

<GroceryItemCard
key={item._id}
name={item.name}
category={item.category}
image={item.image}
price={item.price}
mrp={item.mrp}
unit={item.unit}
_id={item._id.toString()}
/>

))}

</div>

</section>



{/* CATEGORY PRODUCTS */}

<section className="w-[90%] md:w-[80%] mx-auto mt-14">

{categories.map((cat:any,index:number)=>{

const products=groceryList.filter(
(item:any)=>item.category===cat
);

return(

<div key={index} className="mb-12">

<h2 className="text-2xl font-bold text-green-700 mb-5">

{cat}

</h2>


<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

{products.map((item:any)=>(

<GroceryItemCard
key={item._id}
name={item.name}
category={item.category}
image={item.image}
price={item.price}
mrp={item.mrp}
unit={item.unit}
_id={item._id.toString()}
/>

))}

</div>

</div>

)

})}

</section>



{/* 🏪 SHOP LOCATION */}

<section className="w-[90%] md:w-[80%] mx-auto mt-16 mb-16">

<h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-8 text-center">

📍 Visit Our Shop

</h2>


<div className="grid md:grid-cols-2 gap-8 items-center">


{/* Google Map */}

<div className="rounded-2xl overflow-hidden shadow-lg">

<iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.1113262052722!2d88.34589917508241!3d22.72410317938401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89b023b3008a5%3A0x55408fb897c58fa1!2sAnuradha%20Bhandar!5e0!3m2!1sen!2sin!4v1772437704937!5m2!1sen!2sin"
width="100%"
height="350"
style={{border:0}}
loading="lazy"
/>

</div>



{/* Shop Image */}

<div className="rounded-2xl overflow-hidden shadow-lg">

<img
src="/shop.png"
alt="Anuradha Bhandar"
className="w-full h-[350px] object-cover"
/>

</div>


</div>

</section>


</>
)

}