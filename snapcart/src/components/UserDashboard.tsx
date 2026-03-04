import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import Banner from "@/models/banner.model";
import OfferBanner from "./OfferBanner";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import GroceryItemCard from "./GroceryItemCard";
import { auth } from "@/auth";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function UserDashboard({ searchParams }: Props) {

  await connectDb();
const resolvedSearch = await searchParams;
const banner = await Banner.findOne({ isActive: true }).lean<any>();
 const categoryData = [
  { name: "Fruits & Vegetables", image: "/categories/fruits.png" },
  { name: "Dairy & Eggs", image: "/categories/dairy.png" },
  { name: "Rice, Atta & Grains", image: "/categories/rice.png" },
  { name: "Snacks & Biscuits", image: "/categories/snacks.png" },
  { name: "Spices & Masalas", image: "/categories/spices.png" },
  { name: "Beverages & Drinks", image: "/categories/drinks.png" },
  { name: "Personal Care", image: "/categories/personal.png" },
  { name: "Household Essentials", image: "/categories/household.png" },
  { name: "Instant & Packaged Food", image: "/categories/instant.png" },
  { name: "Baby & Pet Care", image: "/categories/baby.png" },
];

  let groceryList;

if (resolvedSearch?.q) {
  groceryList = await Grocery.find({
    name: { $regex: resolvedSearch.q, $options: "i" }
  }).lean();
} else {
  groceryList = await Grocery.find({}).lean();
}
  const session = await auth();

  let popularProducts:any[] = [];

  if(session?.user?.email){

    const dbUser = await User.findOne({
      email: session.user.email
    });

    if(dbUser){

      const orders = await Order.find({
        user: dbUser._id
      }).lean();

      const countMap:any={};

      orders.forEach((order:any)=>{
        order.items?.forEach((item:any)=>{
          const id = item.product.toString();
          countMap[id] = (countMap[id] || 0) + item.quantity;
        });
      });

      const popularIds = Object.entries(countMap)
      .sort((a:any,b:any)=>b[1]-a[1])
      .slice(0,8)
      .map((i:any)=>i[0]);

      popularProducts = groceryList.filter((item:any)=>
        popularIds.includes(item._id.toString())
      );
    }
  }

  if(popularProducts.length===0){
    popularProducts = groceryList
    .sort(()=>0.5-Math.random())
    .slice(0,8);
  }

  const categories=[
    ...new Set(groceryList.map((item:any)=>item.category))
  ];

 return(
<>

<HeroSection/>

{banner && (
  <OfferBanner
    title={banner.title}
     discountText={banner.discountText}
    minOrderAmount={banner.minOrderAmount}
    image={banner.image}
  />
)}



{/* 🔥 STICKY CATEGORY BAR */}
<div className="px-4 sm:px-6 md:px-0 w-full md:w-[92%] mx-auto mt-6">

  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-y-6 gap-x-4">

    {categoryData.map((cat, index) => (
      <a
        key={index}
        href={`/category/${encodeURIComponent(cat.name)}`}
        className="flex flex-col items-center"
      >

        {/* Icon Box */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 bg-white rounded-2xl 
                        flex items-center justify-center 
                        border border-gray-100 
                        shadow-sm hover:shadow-md 
                        transition duration-200">

          <img
            src={cat.image}
            alt={cat.name}
            className="max-w-[65%] max-h-[65%] object-contain"
          />

        </div>

        {/* Category Name */}
        <p className="text-[11px] sm:text-xs text-center mt-2 
                      font-medium text-gray-700 leading-tight">
          {cat.name}
        </p>

      </a>
    ))}

  </div>

</div>


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

const products=groceryList
.filter((item:any)=>item.category===cat)
.slice(0,4); // 👈 home par sirf 4 show

return(

<div key={index} id={cat} className="mb-16 scroll-mt-32">

<div className="flex justify-between items-center mb-5">

<h2 className="text-2xl font-bold text-green-700">
{cat}
</h2>

<Link
  href={`/category/${encodeURIComponent(cat)}`}
  className="group relative inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-green-700 border border-green-600 rounded-full overflow-hidden transition-all duration-300 hover:text-white"
>
  <span className="absolute inset-0 bg-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
  <span className="relative z-10 flex items-center gap-2">
    View All
    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
  </span>
</Link>

</div>

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

</>
)
}