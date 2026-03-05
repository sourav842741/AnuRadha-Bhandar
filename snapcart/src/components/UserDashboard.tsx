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
      name: { $regex: resolvedSearch.q, $options: "i" },
    }).lean();
  } else {
    groceryList = await Grocery.find({}).lean();
  }

  const session = await auth();

  let popularProducts: any[] = [];

  if (session?.user?.email) {

    const dbUser = await User.findOne({
      email: session.user.email,
    });

    if (dbUser) {

      const orders = await Order.find({
        user: dbUser._id,
      }).lean();

      const countMap: any = {};

      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const id = item.product.toString();
          countMap[id] = (countMap[id] || 0) + item.quantity;
        });
      });

      const popularIds = Object.entries(countMap)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 8)
        .map((i: any) => i[0]);

      popularProducts = groceryList.filter((item: any) =>
        popularIds.includes(item._id.toString())
      );
    }
  }

  if (popularProducts.length === 0) {
    popularProducts = groceryList.sort(() => 0.5 - Math.random()).slice(0, 8);
  }

  /* 🔥 TRENDING PRODUCTS */
  const allOrders = await Order.find({}).lean();

  const trendingMap: any = {};

  allOrders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      const id = item.product.toString();
      trendingMap[id] = (trendingMap[id] || 0) + item.quantity;
    });
  });

  const trendingIds = Object.entries(trendingMap)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 8)
    .map((i: any) => i[0]);

  const trendingProducts = groceryList.filter((item: any) =>
    trendingIds.includes(item._id.toString())
  );

  /* 🧠 RECOMMENDED PRODUCTS */
  let recommendedProducts: any[] = [];

  if (session?.user?.email) {

    const dbUser = await User.findOne({
      email: session.user.email,
    });

    if (dbUser) {

      const orders = await Order.find({
        user: dbUser._id,
      }).lean();

      const categoryMap: any = {};

      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {

          const product = groceryList.find(
            (g: any) => g._id.toString() === item.product.toString()
          );

          if (product) {
            categoryMap[product.category] =
              (categoryMap[product.category] || 0) + item.quantity;
          }

        });
      });

      const topCategories = Object.entries(categoryMap)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 2)
        .map((c: any) => c[0]);

      recommendedProducts = groceryList
        .filter((item: any) => topCategories.includes(item.category))
        .slice(0, 8);
    }
  }

  const categories = [...new Set(groceryList.map((item: any) => item.category))];

  return (
    <>
      <HeroSection />

      {banner && (
        <OfferBanner
          title={banner.title}
          discountText={banner.discountText}
          minOrderAmount={banner.minOrderAmount}
          image={banner.image}
        />
      )}

      {/* CATEGORY BAR */}

      <div className="px-4 sm:px-6 md:px-0 w-full md:w-[92%] mx-auto mt-6">

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-y-6 gap-x-4">

          {categoryData.map((cat, index) => (
            <a
              key={index}
              href={`/category/${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center"
            >

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

              <p className="text-[11px] sm:text-xs text-center mt-2 
                            font-medium text-gray-700 leading-tight">
                {cat.name}
              </p>

            </a>
          ))}

        </div>

      </div>

      {/* 🔥 TRENDING PRODUCTS */}

     <section className="w-[92%] md:w-[80%] mx-auto mt-10 
border border-green-300 rounded-2xl 
bg-linear-to-b from-green-100 to-white 
shadow-sm p-6">

        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          🔥 Trending Products
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

          {trendingProducts.map((item: any) => (

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

      {/* ⭐ POPULAR PRODUCTS */}

      <section className="w-[92%] md:w-[80%] mx-auto mt-10 
border border-yellow-300 rounded-2xl 
bg-linear-to-b from-yellow-100 to-white 
shadow-sm p-6">

        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          ⭐ Popular Items For You
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

          {popularProducts.map((item: any) => (

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

      {/* 🧠 RECOMMENDED */}

      {recommendedProducts.length > 0 && (

        <section className="w-[92%] md:w-[80%] mx-auto mt-14 
border border-purple-300 rounded-2xl 
bg-linear-to-b from-purple-100 to-white 
shadow-sm p-6">

          <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
            🧠 Recommended For You
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

            {recommendedProducts.map((item: any) => (

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

      )}

      {/* CATEGORY PRODUCTS */}

      <section className="w-[90%] md:w-[80%] mx-auto mt-14">

        {categories.map((cat: any, index: number) => {

          const products = groceryList
            .filter((item: any) => item.category === cat)
            .slice(0, 4);

          return (

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

                {products.map((item: any) => (

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

          );

        })}

      </section>

      <section className="w-[92%] md:w-[80%] mx-auto mt-12">

{/* STORE HEADER */}

<div className="flex flex-col md:flex-row items-center gap-6 mb-8">

{/* STORE IMAGE */}
<div className="w-full md:w-[40%]">

<img
src="/shop.png"
alt="Anuradha Bhandar"
className="w-full h-[220px] md:h-[260px] object-cover rounded-xl shadow"
/>

</div>

{/* STORE DETAILS */}
<div className="w-full md:w-[60%]">

<h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-3">
 Anuradha Bhandar Store
</h2>

<p className="text-gray-600 mb-3">
Fresh groceries delivered fast. Visit our store or order online anytime.
</p>

<div className="text-sm text-gray-700 space-y-1">

<p>📍 Anuradha Bhandar, Kolkata</p>
<p>📞 +91 88476 08613</p>
<p>⏰ Open: 7:00 AM – 2:00 PM</p>
<p>⏰ Open: 4:00 PM – 10:00 PM</p>

</div>

</div>

</div>


{/* GOOGLE MAP */}

<div className="w-full rounded-xl overflow-hidden shadow">

<iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.1113262052604!2d88.34589917490216!3d22.724103179384123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89b023b3008a5%3A0x55408fb897c58fa1!2sAnuradha%20Bhandar!5e0!3m2!1sen!2sin!4v1772697010461!5m2!1sen!2sin"
width="100%"
height="420"
style={{ border: 0 }}
loading="lazy"
referrerPolicy="no-referrer-when-downgrade"
/>

</div>

</section>
    </>
  );
}