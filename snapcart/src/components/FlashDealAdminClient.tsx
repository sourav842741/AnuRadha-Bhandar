"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Loader2, X, Check, Edit2, Trash2 } from "lucide-react";

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
  createdAt: string;
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

export default function FlashDealAdminClient({ products }: { products: Product[] }) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit mode state
  const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Existing flash deals
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [showDeals, setShowDeals] = useState(false);

  // Search/filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch existing flash deals
  const fetchFlashDeals = async () => {
    try {
      const res = await axios.get("/api/admin/flash-deal");
      setFlashDeals(res.data);
    } catch (error) {
      console.error("Error fetching flash deals:", error);
    }
  };

  useEffect(() => {
    fetchFlashDeals();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!title || !startTime || !endTime || selectedProducts.length === 0) {
      alert("Please fill all fields and select at least one product");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/admin/flash-deal", {
        title,
        startTime,
        endTime,
        products: selectedProducts,
      });

      alert("Flash Deal Created Successfully!");
      
      // Reset form
      setTitle("");
      setStartTime("");
      setEndTime("");
      setSelectedProducts([]);
      
      // Refresh deals
      fetchFlashDeals();
    } catch (error) {
      console.error("Error creating flash deal:", error);
      alert("Error creating flash deal");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert Date to datetime-local format
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Handle edit click
  const handleEditClick = (deal: FlashDeal) => {
    setEditingDeal(deal);
    setTitle(deal.title);
    setStartTime(formatDateForInput(deal.startTime));
    setEndTime(formatDateForInput(deal.endTime));
    
    // Extract product IDs from the deal
    const productIds = deal.products.map((p) => p._id);
    setSelectedProducts(productIds);
    
    setIsEditMode(true);
    setShowDeals(false); // Switch to create form view
  };

  // Handle update
  const handleUpdate = async () => {
    if (!title || !startTime || !endTime || selectedProducts.length === 0) {
      alert("Please fill all fields and select at least one product");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/admin/flash-deal/${editingDeal?._id}`, {
        title,
        startTime,
        endTime,
        products: selectedProducts,
      });

      alert("Flash Deal Updated Successfully!");
      
      // Reset form and exit edit mode
      resetForm();
      
      // Refresh deals
      fetchFlashDeals();
    } catch (error) {
      console.error("Error updating flash deal:", error);
      alert("Error updating flash deal");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this flash deal?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/flash-deal/${dealId}`);
      alert("Flash Deal Deleted Successfully!");
      
      // Refresh deals
      fetchFlashDeals();
    } catch (error) {
      console.error("Error deleting flash deal:", error);
      alert("Error deleting flash deal");
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setSelectedProducts([]);
    setEditingDeal(null);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Flash Deal Manager
          </h1>

          <button
            onClick={() => setShowDeals(!showDeals)}
            className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            {showDeals ? "Create Deal" : "View Deals"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {showDeals ? (
          /* View Existing Deals */
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Existing Flash Deals</h2>
            {flashDeals.length === 0 ? (
              <p className="text-gray-500">No flash deals created yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashDeals.map((deal) => (
                  <div
                    key={deal._id}
                    className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{deal.title}</h3>
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                        {deal.products?.length || 0} Products
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3 space-y-1">
                      <p>
                        <span className="font-semibold">Start:</span>{" "}
                        {formatDate(deal.startTime)}
                      </p>
                      <p>
                        <span className="font-semibold">End:</span>{" "}
                        {formatDate(deal.endTime)}
                      </p>
                    </div>

                    {/* Products in deal */}
                    {deal.products && deal.products.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-3">
                        {deal.products.slice(0, 3).map((p) => (
                          <div
                            key={p._id}
                            className="w-12 h-12 relative rounded overflow-hidden border"
                          >
                            <Image
                              src={p.image || "/placeholder.png"}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {deal.products.length > 3 && (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">
                            +{deal.products.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-400">
                      Created: {formatDate(deal.createdAt)}
                    </div>

                    {/* Edit and Delete Buttons */}
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <button
                        onClick={() => handleEditClick(deal)}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(deal._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Create New Deal Form */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold text-green-700 mb-4">
                  {isEditMode ? "Edit Flash Deal" : "Create New Deal"}
                </h2>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Sale - 50% Off"
                      className="w-full border p-3 rounded-lg"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border p-3 rounded-lg"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border p-3 rounded-lg"
                    />
                  </div>

                  {/* Selected Products Summary */}
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">
                      {selectedProducts.length} product
                      {selectedProducts.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>

                  {/* Submit Button */}
                  {isEditMode ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleUpdate}
                        disabled={loading || selectedProducts.length === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Zap />
                            Update Flash Deal
                          </>
                        )}
                      </button>
                      <button
                        onClick={resetForm}
                        className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || selectedProducts.length === 0}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-green-700 transition"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap />
                          Create Flash Deal
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Product Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Select Products
                </h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 border p-3 rounded-lg"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border p-3 rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product._id);
                    return (
                      <div
                        key={product._id}
                        onClick={() => toggleProduct(product._id)}
                        className={`border rounded-lg p-3 cursor-pointer transition relative ${
                          isSelected
                            ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                            : "hover:border-green-300 hover:shadow"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition ${
                            isSelected
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                        </div>

                        {/* Product Image */}
                        <div className="relative w-full h-24 mb-2">
                          <Image
                            src={product.image || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>

                        {/* Product Info */}
                        <h3 className="font-medium text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm">
                          <span className="text-green-700 font-bold">
                            ₹{product.price}
                          </span>
                          <span className="text-gray-400 line-through ml-1">
                            ₹{product.mrp}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">/{product.unit}</p>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No products found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

