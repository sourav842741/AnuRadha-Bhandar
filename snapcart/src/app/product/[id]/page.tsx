import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import User from "@/models/user.model";
import Nav from "@/components/Nav";
import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
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
          <Link
            href="/"
            className="text-green-600 hover:underline"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const plainProduct = JSON.parse(JSON.stringify(product));

  // Fetch full user data from database for proper role check
  let navUser = null;
  if (session?.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email })
      .select("name role image email mobile")
      .lean();
    
    if (dbUser) {
      navUser = JSON.parse(JSON.stringify(dbUser));
    }
  }

  return (
    <>
      {navUser && <Nav user={navUser} />}

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Back Button */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800"
            >
              <ArrowLeft size={20} />
              Back to Shopping
            </Link>
          </div>
        </div>

        {/* Product Detail Client Component */}
        <ProductDetailClient product={plainProduct} />
      </div>
    </>
  );
}

