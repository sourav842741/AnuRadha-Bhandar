"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCouponPage() {
  const { id } = useParams();
  const router = useRouter();

  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ========================
     FETCH SINGLE COUPON
  ======================== */
  useEffect(() => {
    const fetchCoupon = async () => {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();

      const found = data.find((c: any) => c._id === id);

      setCoupon(found);
      setLoading(false);
    };

    fetchCoupon();
  }, [id]);

  /* ========================
     UPDATE COUPON
  ======================== */
  const handleUpdate = async (e: any) => {
    e.preventDefault();

    await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });

    router.push("/admin/coupons");
  };

  /* ========================
     DELETE COUPON
  ======================== */
  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete?");

    if (!confirmDelete) return;

    await fetch(`/api/admin/coupons/${id}`, {
      method: "DELETE",
    });

    router.push("/admin/coupons");
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!coupon) return <p className="p-6">Coupon not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
      >
        ← Back
      </button>

      <div className="max-w-xl bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Edit Coupon</h1>

        <form onSubmit={handleUpdate} className="space-y-4">

          {/* CODE */}
          <input
            type="text"
            value={coupon.code}
            onChange={(e) =>
              setCoupon({ ...coupon, code: e.target.value })
            }
            className="w-full border p-3 rounded-lg"
            placeholder="Coupon Code"
          />

          {/* DISCOUNT */}
          <input
            type="number"
            value={coupon.discountValue}
            onChange={(e) =>
              setCoupon({
                ...coupon,
                discountValue: Number(e.target.value),
              })
            }
            className="w-full border p-3 rounded-lg"
            placeholder="Discount %"
          />

          {/* MIN ORDER */}
          <input
            type="number"
            value={coupon.minOrderAmount || ""}
            onChange={(e) =>
              setCoupon({
                ...coupon,
                minOrderAmount: Number(e.target.value),
              })
            }
            className="w-full border p-3 rounded-lg"
            placeholder="Minimum Order Amount"
          />

          {/* EXPIRY */}
          <input
            type="date"
            value={
              coupon.expiryDate
                ? coupon.expiryDate.split("T")[0]
                : ""
            }
            onChange={(e) =>
              setCoupon({
                ...coupon,
                expiryDate: e.target.value,
              })
            }
            className="w-full border p-3 rounded-lg"
          />

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-lg"
            >
              Update
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-500 text-white rounded-lg"
            >
              Delete
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}