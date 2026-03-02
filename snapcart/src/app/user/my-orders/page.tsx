"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import OrderCard from "@/components/OrderCard";
import { PackageSearch, ArrowLeftCircle } from "lucide-react";
import { getSocket } from "@/lib/socket";

function MyOrders() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.userData);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* Fetch Orders */
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      try {
        const { data } = await axios.get(`/api/user/order/${user._id}`);
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

  /* Realtime */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const statusHandler = (data: any) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId
            ? {
                ...o,
                status: data.status,
                assignedDeliveryBoy:
                  data.assignedDeliveryBoy || o.assignedDeliveryBoy,
              }
            : o
        )
      );
    };

    socket.on("order-status-updated", statusHandler);

    return () => {
      socket.off("order-status-updated", statusHandler);
    };
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-gray-100 min-h-screen w-full">

      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 relative">

        {/* Header */}
        <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
          <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
            <button
  onClick={() => router.push("/")}
  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
>
  <ArrowLeftCircle size={24} className="text-green-700" />
</button>

            <h1 className="text-xl font-bold text-gray-800">
              My Orders
            </h1>
          </div>
        </div>

        {/* ⭐ BEAUTIFUL SKELETON LOADER */}
        {loading ? (
          <div className="space-y-6 mt-6">

            {[1,2,3].map((i)=>(
              <div
                key={i}
                className="bg-white rounded-2xl shadow p-5 space-y-4 animate-pulse"
              >

                <div className="flex justify-between">
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>

                <div className="h-3 w-52 bg-gray-200 rounded"></div>

                <div className="h-12 w-full bg-gray-200 rounded-xl"></div>

                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>

              </div>
            ))}

            <div className="text-center text-gray-500 mt-6 font-medium">
              Loading your orders...
            </div>

          </div>

        ) : orders.length === 0 ? (

          /* Empty State */
          <div className="pt-20 flex flex-col items-center text-center">
            <PackageSearch size={70} className="text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              No Orders Found
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Start shopping to view your orders here.
            </p>
          </div>

        ) : (

          /* Orders */
          <div className="mt-4 space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>

        )}
      </div>
    </section>
  );
}

export default MyOrders;