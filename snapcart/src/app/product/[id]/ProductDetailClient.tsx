"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { addToCart, increaseQuantity, decreaseQuantity } from "@/redux/cartSlice";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Check, Home, Clock, ShieldCheck, RefreshCw, Banknote, BadgeCheck } from "lucide-react";
import ReviewSection from "@/components/ReviewSection";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: string;
  mrp: string;
  unit: string;
  image: string;
  description?: string;
}

interface UserAddress {
  fullName?: string;
  fullAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface ProductDetailClientProps {
  product: Product;
  userAddress?: UserAddress | null;
}

export default function ProductDetailClient({ product, userAddress }: ProductDetailClientProps) {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.cartData);
  const cartItem = cart.find((item) => item._id?.toString() === product._id);
  
  // Get location from localStorage (same as Navbar uses)
  const [detectedAddress, setDetectedAddress] = useState<string>("");
  
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setDetectedAddress(parsed.address || "");
      } catch (err) {
        console.error("Error parsing location:", err);
      }
    }
  }, []);
  
  // Description is now stored in the database - no generation needed
  const description = product.description || "";

  const discount = product.mrp && product.price
    ? Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)
    : 0;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: product._id as any,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        category: product.category,
        unit: product.unit,
      })
    );
  };

  // Use detected address from localStorage, fallback to userAddress from props
  const displayAddress = detectedAddress || userAddress?.fullAddress || "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="relative w-full aspect-square">
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg z-10">
                {discount}% OFF
              </div>
            )}
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-700">₹{product.price}</span>
            <span className="text-xl text-gray-500 line-through">₹{product.mrp}</span>
            <span className="text-green-600 font-semibold">{discount}% off</span>
          </div>

          {/* Unit */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">/{product.unit}</span>
          </div>

          {/* Cart Button */}
          {!cartItem ? (
            <button
              onClick={handleAddToCart}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-green-50 border border-green-200 rounded-full py-2 px-6 gap-4">
                <button
                  onClick={() => dispatch(decreaseQuantity(product._id))}
                  className="p-1 hover:bg-green-100 rounded-full"
                >
                  <Minus size={20} />
                </button>
                <span className="font-semibold text-lg">{cartItem.quantity}</span>
                <button
                  onClick={() => dispatch(increaseQuantity(product._id))}
                  className="p-1 hover:bg-green-100 rounded-full"
                >
                  <Plus size={20} />
                </button>
              </div>
              <span className="text-green-700 font-semibold">
                <Check size={20} className="inline" /> In Cart
              </span>
            </div>
          )}

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 className="font-semibold text-gray-800">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Unit:</span>
                <span className="ml-2 font-medium">{product.unit}</span>
              </div>
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-2 font-medium">₹{product.price}</span>
              </div>
              <div>
                <span className="text-gray-500">MRP:</span>
                <span className="ml-2 font-medium">₹{product.mrp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        {/* User Location Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">HOME</p>
              <p className="text-sm text-gray-800 font-medium">
                {displayAddress || "Add delivery address"}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-green-600" />
          <span className="text-gray-600">Delivery in </span>
          <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-sm">
            20 minutes
          </span>
        </div>

        {/* Fulfilled By */}
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Fulfilled by </span>
            <span className="font-bold text-green-700">Anuradha Bhandar</span>
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <span className="text-yellow-500">4.2 ★</span>
            <span>• Trusted local grocery partner</span>
          </p>
        </div>

        {/* Feature Icons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-orange-600" />
            </div>
            <span>Doorstep cancellation</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-red-600" />
            </div>
            <span>No returns</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Banknote className="w-3 h-3 text-blue-600" />
            </div>
            <span>Cash on Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <BadgeCheck className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-semibold text-green-700">Anuradha Bhandar Assured</span>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Description</h2>
        
        {/* Description Display */}
        {description.trim() ? (
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No description available for this product.
          </p>
        )}
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={product._id} productName={product.name} />
    </div>
  );
}

