import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import GroceryItemCard from "@/components/GroceryItemCard";
import NoProductsFound from "@/components/NoProductsFound";
import Nav from "@/components/Nav";
import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sort?: string; price?: string; q?: string }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const session = await auth();

  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const categoryName = decodeURIComponent(resolvedParams.name);

  await connectDb();

  // 🔥 SORT LOGIC
  let sortOption: any = {};

  if (resolvedSearch.sort === "low") {
    sortOption = { price: 1 };
  } else if (resolvedSearch.sort === "high") {
    sortOption = { price: -1 };
  }

  // 🔥 PRICE FILTER
  let priceFilter: any = {};

  if (resolvedSearch.price === "100") {
    priceFilter = { price: { $lte: 100 } };
  }

  // 🔥 SEARCH FILTER (NEW ADDED)
  let searchFilter: any = {};

  if (resolvedSearch.q) {
    searchFilter = {
      name: { $regex: resolvedSearch.q, $options: "i" },
    };
  }

  // 🔥 FINAL QUERY
  const products = await Grocery.find({
    ...(resolvedSearch.q ? {} : { category: categoryName }),
    ...priceFilter,
    ...searchFilter,
  })
    .sort(sortOption)
    .lean();

  return (
    <>
      {session?.user?.name && <Nav user={session.user as any} />}

      <section className="w-[90%] md:w-[80%] mx-auto mt-32 mb-16">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
    bg-white/30 backdrop-blur-xl border border-white/30 
    text-green-700 font-semibold 
    hover:bg-green-600 hover:text-white 
    transition-all duration-300 shadow-md"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-8 text-center">
          {categoryName} Products
        </h1>

        {/* FILTER SECTION */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          {/* Low to High */}
          <Link
            href={`?sort=low${resolvedSearch.q ? `&q=${resolvedSearch.q}` : ""}`}
            className="group relative px-6 py-2.5 rounded-2xl 
            backdrop-blur-xl bg-white/20 
            border border-white/30 
            shadow-lg 
            text-green-700 font-semibold 
            hover:bg-green-600/80 hover:text-white 
            transition-all duration-300"
          >
            Price: Low to High
          </Link>

          {/* High to Low */}
          <Link
            href={`?sort=high${resolvedSearch.q ? `&q=${resolvedSearch.q}` : ""}`}
            className="group relative px-6 py-2.5 rounded-2xl 
            backdrop-blur-xl bg-white/20 
            border border-white/30 
            shadow-lg 
            text-green-700 font-semibold 
            hover:bg-green-600/80 hover:text-white 
            transition-all duration-300"
          >
            Price: High to Low
          </Link>

          {/* Clear Filter */}
          <Link
            href={`/category/${encodeURIComponent(categoryName)}`}
            className="px-6 py-2.5 rounded-2xl 
            bg-gray-200/60 backdrop-blur-xl
            text-gray-700 font-semibold 
            hover:bg-gray-300 transition-all duration-300"
          >
            Clear Filters
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <NoProductsFound categoryName={categoryName} />
        ) : (
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
        )}
      </section>
    </>
  );
}
