"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import StarRating from "./StarRating";
import { Loader2, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Review {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

// Rating label helper function
const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  if (rating >= 3.0) return "Average";
  return "Poor";
};

// Rating badge color helper
const getRatingBadgeColor = (rating: number): string => {
  if (rating >= 4.5) return "bg-green-600";
  if (rating >= 4.0) return "bg-green-500";
  if (rating >= 3.5) return "bg-yellow-500";
  if (rating >= 3.0) return "bg-orange-500";
  return "bg-red-500";
};

export default function ReviewSection({ productId, productName }: ReviewSectionProps) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLoggedIn = status === "authenticated" && !!session?.user;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/reviews?productId=${productId}`);
      setAllReviews(res.data.reviews);
      setReviews(res.data.reviews.slice(0, 3)); // Latest 3 only
      setAverageRating(parseFloat(res.data.averageRating));
      setTotalReviews(res.data.totalReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isLoggedIn) {
      setError("Please login to add a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("/api/reviews", {
        productId,
        rating,
        comment,
      });

      setSuccess("Review submitted successfully!");
      setRating(0);
      setComment("");
      
      fetchReviews();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date as "2 days ago"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format number with commas
  const formatRatingCount = (count: number): string => {
    return new Intl.NumberFormat('en-IN').format(count);
  };

  const ratingLabel = getRatingLabel(averageRating);
  const badgeColor = getRatingBadgeColor(averageRating);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Customer Reviews
      </h2>

      {/* Flipkart-style Rating Summary */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Rating Number */}
          <div className="text-5xl font-bold text-gray-800">
            {averageRating.toFixed(1)}
          </div>
          
          {/* Stars and Label */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1 mb-1">
              {/* Star Icon in Green */}
              <svg className="w-6 h-6 text-green-600 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {/* Rating Badge */}
              <span className={`${badgeColor} text-white text-sm font-semibold px-2 py-1 rounded`}>
                {ratingLabel}
              </span>
            </div>
            {/* Total Ratings Count */}
            <div className="text-sm text-gray-500">
              based on <span className="font-semibold">{formatRatingCount(totalReviews)}</span> ratings by Verified Buyers
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-green-50 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-green-800 mb-4">Write a Review</h3>

        {!isLoggedIn ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">Please login to write a review</p>
            <Link
              href="/login"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Login to Review
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Your Rating:</span>
              <StarRating
                rating={rating}
                interactive
                size={28}
                onChange={setRating}
              />
            </div>

            {/* Comment Textarea */}
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-green-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />

            {/* Error/Success Messages */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm">{success}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Review
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Latest 3 Reviews */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            Latest Reviews
          </h3>
          {totalReviews > 3 && (
            <Link
              href={`/product/${productId}/reviews`}
              className="text-green-600 font-semibold flex items-center gap-1 hover:underline"
            >
              View All Reviews <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-green-600" size={32} />
          </div>
        ) : allReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {review.userName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

