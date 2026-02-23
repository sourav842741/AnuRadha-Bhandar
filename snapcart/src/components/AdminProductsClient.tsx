"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Pencil,
  X,
  Save,
  ArrowLeft,
  Package,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
}

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Biscuits",
  "Spices & Masalas",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
];

const units = ["kg", "g", "liter", "ml", "piece", "pack"];

export default function AdminProductsClient({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ Important Fix (Vercel hydration)
  const [filtered, setFiltered] = useState<Product[]>([]);

  useEffect(() => {
    console.log("Admin Products:", products);
    setFiltered(products);
  }, [products]);

  // 🔍 Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const q = search.toLowerCase();

    const result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    setFiltered(result);
  };

  // 📸 Image Upload Preview
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  // 💾 Save Edit
  const handleEditSave = async () => {
    if (!editing) return;

    const updatedProduct = {
      ...editing,
      image: imagePreview || editing.image,
    };

    const res = await fetch(
      `/api/admin/grocery/${editing._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      }
    );

    if (res.ok) {
      alert("✅ Product updated successfully");

      setEditing(null);

      window.location.reload();
    } else {
      alert("❌ Failed to update product");
    }
  };

  return (
    <section className="pt-4 w-[95%] md:w-[85%] mx-auto pb-20">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-2xl font-bold text-green-700 flex gap-2">
          <Package size={26} />
          Manage Store Products
        </h1>

      </div>

      {/* Search */}

      <form
        onSubmit={handleSearch}
        className="flex items-center border rounded-full px-5 py-3 mb-8 max-w-lg mx-auto"
      >

        <Search className="mr-2" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product..."
          className="w-full outline-none"
        />

      </form>

      {/* Products */}

      <div className="space-y-6">

        {filtered.length === 0 && (
          <div className="text-center text-gray-500">
            No Products Found
          </div>
        )}

        {filtered.map((product) => (

          <div
            key={product._id}
            className="bg-white p-5 rounded-xl shadow flex gap-5"
          >

            <div className="relative w-32 h-32">

              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />

            </div>

            <div className="flex-1">

              <h3 className="font-bold">
                {product.name}
              </h3>

              <p>{product.category}</p>

              <p className="text-green-700 font-bold">
                ₹{product.price}/{product.unit}
              </p>

              <button
                onClick={() => {
                  setEditing(product);
                  setImagePreview(product.image);
                }}
                className="bg-green-600 text-white px-4 py-2 mt-3 rounded-lg flex gap-2"
              >
                <Pencil size={15} />
                Edit
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* Edit Modal */}

      <AnimatePresence>

        {editing && (

          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center"
          >

            <div className="bg-white p-6 rounded-xl w-96">

              <h2 className="text-xl font-bold mb-4">
                Edit Product
              </h2>

              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    name: e.target.value,
                  })
                }
                className="border p-2 w-full mb-3"
              />

              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value,
                  })
                }
                className="border p-2 w-full mb-3"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <input
                value={editing.price}
                type="number"
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    price: Number(e.target.value),
                  })
                }
                className="border p-2 w-full mb-3"
              />

              <select
                value={editing.unit}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    unit: e.target.value,
                  })
                }
                className="border p-2 w-full mb-3"
              >
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>

              <input
                type="file"
                onChange={handleImageChange}
                className="mb-3"
              />

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setEditing(null)}
                  className="border px-3 py-1"
                >
                  Cancel
                </button>

                <button
                  onClick={handleEditSave}
                  className="bg-green-600 text-white px-3 py-1"
                >
                  Save
                </button>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </section>
  );
}