"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  title: string;
  discountText: string;
  minOrderAmount: number;
  image?: string;
}

export default function OfferBanner({
  title,
  discountText,
  minOrderAmount,
  image,
}: Props) {
  console.log("Banner props:", { title, discountText, minOrderAmount });
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[95%] md:w-[90%] mx-auto mt-6"
    >
      <div className="relative h-[140px] rounded-2xl overflow-hidden shadow-lg">

        {/* Banner Image */}
        {image && (
          <Image
            src={image}
            alt="Offer Banner"
            fill
            className="object-cover"
          />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">

          {/* Offer Title */}
          <h2 className="text-2xl md:text-3xl font-bold">
            🎉 {title}
          </h2>

          {/* Coupon Code */}
          <p className="bg-yellow-400 text-black px-3 py-1 rounded mt-2 text-sm font-semibold">
            Use Code: {discountText}
          </p>

          {/* Min Order */}
          <p className="text-sm md:text-base mt-1">
            On orders above ₹{minOrderAmount}
          </p>

        </div>

      </div>
    </motion.div>
  );
}