"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCouponPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    expiryDate: "",
    usageLimit: ""
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    try {

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Failed");

      alert("✅ Coupon Created Successfully");

      router.push("/admin/coupons");

    } catch (err) {
      alert("❌ Error Creating Coupon");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-8">
      <div className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-lg">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Coupon
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Coupon Code"
            className="w-full border p-3 rounded-lg"
            value={form.code}
            onChange={(e)=>setForm({...form, code:e.target.value.toUpperCase()})}
            required
          />

          <select
            className="w-full border p-3 rounded-lg"
            onChange={(e)=>setForm({...form, discountType:e.target.value})}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <input
            type="number"
            placeholder="Discount Value"
            className="w-full border p-3 rounded-lg"
            value={form.discountValue}
            onChange={(e)=>setForm({...form, discountValue:e.target.value})}
            required
          />

          <input
            type="number"
            placeholder="Minimum Order Amount"
            className="w-full border p-3 rounded-lg"
            value={form.minOrderAmount}
            onChange={(e)=>setForm({...form, minOrderAmount:e.target.value})}
          />

          <input
            type="date"
            className="w-full border p-3 rounded-lg"
            value={form.expiryDate}
            onChange={(e)=>setForm({...form, expiryDate:e.target.value})}
          />

          <input
            type="number"
            placeholder="Usage Limit"
            className="w-full border p-3 rounded-lg"
            value={form.usageLimit}
            onChange={(e)=>setForm({...form, usageLimit:e.target.value})}
          />

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>

        </form>

      </div>
    </div>
  );
}