"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NoProductsFound({ categoryName }: { categoryName: string }) {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center py-20">

      <div className="relative w-full max-w-lg p-10 rounded-3xl 
      bg-white/30 backdrop-blur-2xl 
      border border-white/40 
      shadow-2xl text-center overflow-hidden">

        {/* Soft Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br 
        from-green-100 via-white to-green-50 opacity-70"></div>

        {/* Animated Icon */}
        <div className="text-7xl mb-6 animate-bounce">
          🛍️
        </div>

        <h2 className="text-3xl font-bold text-green-700 mb-4">
          Oops! No Products Found
        </h2>

        <p className="text-gray-600 mb-8">
          We couldn’t find anything matching your search or filters.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          {/* Go Back */}
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl 
            bg-green-600 text-white font-semibold 
            hover:bg-green-700 
            transition-all duration-300 shadow-lg"
          >
            Go Back
          </button>

          {/* Clear Filters */}
          <Link
            href={`/category/${encodeURIComponent(categoryName)}`}
            className="px-6 py-3 rounded-xl 
            bg-white/60 backdrop-blur-md
            border border-gray-300
            text-gray-700 font-semibold 
            hover:bg-gray-200 
            transition-all duration-300"
          >
            Clear Filters
          </Link>

        </div>

      </div>

    </div>
  );
}