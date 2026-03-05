import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import User from "@/models/user.model";
import Review from "@/models/review.model";
import Nav from "@/components/Nav";
import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import AllReviewsClient from "./AllReviewsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AllReviewsPage({ params }: Props) {
  const resolvedParams = await params;
  const session = await auth();

  await connectDb();

  const product = await Grocery.findById(resolvedParams.id).lean();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h1>
          <Link href="/" className="text-green-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  // Fetch full user data from database for Nav
  let navUser = null;
  if (session?.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email })
      .select("name role image email mobile")
      .lean();
    if (dbUser) {
      navUser = JSON.parse(JSON.stringify(dbUser));
    }
  }

  const reviews = await Review.find({ productId: resolvedParams.id })
    .sort({ createdAt: -1 })
    .lean();

  // Calculate average rating
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
      : 0;

  const plainProduct = JSON.parse(JSON.stringify(product));
  const plainReviews = JSON.parse(JSON.stringify(reviews));

  return (
    <>
      {navUser && <Nav user={navUser} />}

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Back Button */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href={`/product/${resolvedParams.id}`}
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800"
            >
              <ArrowLeft size={20} />
              Back to Product
            </Link>
            <Link
              href={`/product/${resolvedParams.id}`}
              className="text-green-600 font-semibold hover:underline"
            >
              View Product
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Product Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={plainProduct.image}
                  alt={plainProduct.name}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {plainProduct.name}
                </h1>
                <p className="text-gray-500 text-sm">{plainProduct.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-green-700">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    ({totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* All Reviews */}
          <AllReviewsClient
            reviews={plainReviews}
            totalReviews={totalReviews}
            averageRating={avgRating.toFixed(1)}
          />
        </div>
      </div>
    </>
  );
}

