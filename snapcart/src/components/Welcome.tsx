"use client";

import { motion } from "framer-motion";
import {
  ShoppingBasket,
  ArrowRight,
  Bike,
  Sparkles,
} from "lucide-react";

type propType = {
  step: (num: number) => void;
};

function Welcome({ step }: propType) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-8 text-center"
      >

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-2xl shadow">
            <ShoppingBasket className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-green-700">
          AnuRadha Bhandar
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mt-3 leading-relaxed">
          Fresh groceries and daily essentials delivered
          <span className="font-semibold text-green-700"> in minutes</span> 🚀
        </p>

        {/* Icons */}
        <div className="flex justify-center gap-6 mt-6">

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-green-50 p-4 rounded-xl shadow-sm"
          >
            <ShoppingBasket className="text-green-600 w-8 h-8" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
            className="bg-orange-50 p-4 rounded-xl shadow-sm"
          >
            <Bike className="text-orange-500 w-8 h-8" />
          </motion.div>

        </div>

        {/* Tag */}
        <div className="mt-6 flex justify-center">
          <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm flex items-center gap-1">
            <Sparkles size={14} />
            Fast Delivery
          </div>
        </div>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => step(2)}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
        >
          Get Started
          <ArrowRight size={18} />
        </motion.button>

      </motion.div>

    </main>
  );
}

export default Welcome;