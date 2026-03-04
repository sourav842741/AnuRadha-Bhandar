"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  calculateTotals,
  setCoupon, // ✅ added
} from "@/redux/cartSlice";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const cart = useSelector((state: RootState) => state.cart.cartData);

  // ✅ Now using Redux values
  const { subtotal, discount } = useSelector(
    (state: RootState) => state.cart
  );

  const [showFreePopup, setShowFreePopup] = useState(false);
  const FREE_THRESHOLD = 100;
  const DELIVERY_CHARGE = 20;

  // Local input only (NOT discount)
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    dispatch(calculateTotals());
  }, [cart, dispatch]);

  useEffect(() => {
    setShowFreePopup(Number(subtotal) >= FREE_THRESHOLD);
  }, [subtotal]);

  useEffect(() => {
  if (couponMessage) {
    const timer = setTimeout(() => {
      setCouponMessage("");
    }, 10000);

    return () => clearTimeout(timer);
  }
}, [couponMessage]);

  // ✅ APPLY COUPON (Redux version)
  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          cartTotal: subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponMessage(data.message);
        return;
      }

      // 🔥 Store in Redux
     dispatch(
  setCoupon({
    code: couponInput,
    discount: data.discountAmount,
    minOrderAmount: data.minOrderAmount,
  })
);

      setCouponMessage("Coupon applied successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24 relative">
      <Link
        href="/"
        className="absolute -top-2 left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-all"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        🛒 Your Shopping Cart
      </motion.h2>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-6">
            Your cart is empty.
          </p>
          <Link
            href="/"
            className="bg-green-600 text-white px-6 py-3 rounded-full"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-5">
            {cart.map((item) => (
              <div
                key={String(item._id)}
                className="flex flex-col sm:flex-row items-center bg-white rounded-2xl shadow-md p-5 border border-gray-100"
              >
                <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 text-center sm:text-left">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                  <p className="text-green-700 font-bold mt-1">
                    ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <button onClick={() => dispatch(decreaseQuantity(String(item._id)))}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(increaseQuantity(String(item._id)))}>
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(String(item._id)))}
                  className="text-red-500 ml-4"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24 border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>

            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
              🚚 Free Delivery on orders above ₹{FREE_THRESHOLD}
            </div>

            {/* COUPON */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="border p-2 flex-1 rounded-lg text-sm"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-black text-white px-4 rounded-lg text-sm"
                >
                  Apply
                </button>
              </div>

              

              {couponMessage && (
                <p className="text-xs mt-2 text-green-600">
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  ₹{subtotal < FREE_THRESHOLD ? DELIVERY_CHARGE : 0}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-700">
                  ₹{(
                    subtotal +
                    (subtotal < FREE_THRESHOLD ? DELIVERY_CHARGE : 0) -
                    discount
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-full"
              onClick={() => router.push("/user/checkout")}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full mt-3 text-sm text-red-500"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </section>
  );
}