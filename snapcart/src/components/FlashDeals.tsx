"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: string;
  mrp: string;
  unit: string;
  image: string;
}

interface FlashDeal {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  products: Product[];
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) {
    return (
      <span className="text-red-500 font-bold">Expired</span>
    );
  }

  return (
    <div className="flex items-center gap-1 text-orange-600 font-bold">
      <Clock size={16} />
      <span className="bg-orange-100 px-2 py-1 rounded text-sm">
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function FlashDealCard({ deal }: { deal: FlashDeal }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-400">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            <h3 className="font-bold text-lg">{deal.title}</h3>
          </div>
          <CountdownTimer endTime={deal.endTime} />
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {deal.products?.slice(0, 6).map((product) => (
            <Link
              key={product._id}
              href={`/category/${encodeURIComponent(product.category)}`}
              className="flex-shrink-0 w-28 group"
            >
              <div className="relative w-24 h-24 mx-auto mb-2 rounded-lg overflow-hidden border">
                <Image
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition"
                />
                {/* Discount badge */}
                {product.mrp && product.price && (
                  <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-1 py-0.5 rounded-bl">
                    {Math.round(
                      (1 - Number(product.price) / Number(product.mrp)) * 100
                    )}
                    % OFF
                  </div>
                )}
              </div>
              <p className="text-xs font-medium line-clamp-1 text-center">
                {product.name}
              </p>
              <div className="text-center mt-1">
                <span className="text-green-700 font-bold text-sm">
                  ₹{product.price}
                </span>
                {product.mrp && (
                  <span className="text-gray-400 line-through text-xs ml-1">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {deal.products && deal.products.length > 6 && (
          <div className="text-center mt-3">
            <button className="text-orange-600 text-sm font-semibold flex items-center justify-center gap-1 hover:underline">
              View {deal.products.length - 6} more <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlashDeals() {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        const res = await fetch("/api/flash-deal");
        const data = await res.json();
        setFlashDeals(data);
      } catch (error) {
        console.error("Error fetching flash deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashDeals();
  }, []);

  if (loading) {
    return null;
  }

  if (flashDeals.length === 0) {
    return null;
  }

  return (
    <section className="w-[92%] md:w-[80%] mx-auto mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-8 h-8 text-orange-500" />
        <h2 className="text-2xl md:text-3xl font-bold text-green-700">
          ⚡ Flash Deals
        </h2>
      </div>

      <div className="space-y-6">
        {flashDeals.map((deal) => (
          <FlashDealCard key={deal._id} deal={deal} />
        ))}
      </div>
    </section>
  );
}

