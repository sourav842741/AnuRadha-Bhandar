"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data);
  };

  // ✅ TOGGLE FUNCTION ADDED
  const toggleActive = async (id: string) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
      });

      fetchCoupons(); // refresh after toggle
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl md:text-2xl font-semibold">
          Manage Coupons
        </h1>

        <button
          onClick={() => router.push("/admin/coupons/create")}
          className="px-4 py-2 bg-black text-white rounded-lg shadow hover:opacity-90 transition"
        >
          + Add Coupon
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm uppercase">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c: any) => (
              <tr key={c._id} className="border-t">
                <td className="p-4 font-medium">{c.code}</td>
                <td className="p-4">{c.discountValue}%</td>

                {/* ✅ TOGGLE BUTTON */}
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(c._id)}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      c.isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td className="p-4 text-right space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() =>
                      router.push(`/admin/coupons/edit/${c._id}`)
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {coupons.map((c: any) => (
          <div
            key={c._id}
            className="bg-white rounded-xl shadow p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{c.code}</h2>

              {/* ✅ MOBILE TOGGLE */}
              <button
                onClick={() => toggleActive(c._id)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  c.isActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {c.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Discount: {c.discountValue}%
            </p>

            <button
              className="w-full mt-2 py-2 bg-black text-white rounded-lg"
              onClick={() =>
                router.push(`/admin/coupons/edit/${c._id}`)
              }
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}