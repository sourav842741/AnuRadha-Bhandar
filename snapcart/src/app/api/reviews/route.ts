import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Review from "@/models/review.model";
import { auth } from "@/auth";

/* ======================
   ✅ GET REVIEWS BY PRODUCT
   GET /api/reviews?productId=ID
====================== */
export async function GET(req: Request) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: avgRating.toFixed(1),
      totalReviews,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/* ======================
   ✅ CREATE REVIEW
   POST /api/reviews
====================== */
export const POST = auth(async (req) => {
  try {
    await connectDb();

    const session = req.auth;

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Please login to add a review" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    // Validation
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment.trim()) {
      return NextResponse.json(
        { message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    // Check if user already has 2 reviews for this product
    const existingReviews = await Review.find({
      productId,
      userId: session.user.id,
    });

    if (existingReviews.length >= 2) {
      return NextResponse.json(
        { message: "You can only add up to 2 reviews per product" },
        { status: 400 }
      );
    }

    // Create review with user info from session
    const review = await Review.create({
      productId,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      rating,
      comment,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
});

