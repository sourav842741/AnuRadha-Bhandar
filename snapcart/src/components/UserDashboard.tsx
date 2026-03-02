import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import GroceryItemCard from "./GroceryItemCard";

export default async function UserDashboard() {
  // 🧩 Connect to MongoDB
  await connectDb();

  // ✅ Use `.lean()` so Mongoose returns plain JS objects (no ObjectId/Buffer issues)
  const groceryList = await Grocery.find({}).lean();

  return (
    <>
      {/* 🏠 Hero Section */}
      <HeroSection />

      {/* 🛒 Category Slider */}
      <CategorySlider />

      {/* 🛍️ Grocery Items Section */}
      <section className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          🛍️ Popular Grocery Items
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {groceryList.map((item: any, idx: number) => (
            <GroceryItemCard
              key={idx}
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
    </>
  );
}
