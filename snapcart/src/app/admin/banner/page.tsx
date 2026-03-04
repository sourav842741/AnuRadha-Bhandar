"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

type Banner = {
  _id: string;
  title: string;
  minOrderAmount: number;
  discountText: string;
  image: string;
  isActive: boolean;
};

export default function AdminBanner() {

  const [title, setTitle] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const router = useRouter();

  const fetchBanners = async () => {
    const res = await axios.get("/api/admin/banner");
    setBanners(res.data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {

    if (!imageFile) return preview;

    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await axios.post("/api/upload", formData);

    return res.data.url;

  };

  const handleSubmit = async () => {

    const imageUrl = await uploadImage();

    const payload = {
      title,
      minOrderAmount: Number(minOrderAmount),
      discountText,
      image: imageUrl,
      isActive,
    };

    if (editId) {

      await axios.put(`/api/admin/banner/${editId}`, payload);
      alert("Banner Updated");

    } else {

      await axios.post("/api/admin/banner", payload);
      alert("Banner Created");

    }

    resetForm();
    fetchBanners();

  };

  const resetForm = () => {
    setTitle("");
    setMinOrderAmount("");
    setDiscountText("");
    setPreview(null);
    setImageFile(null);
    setEditId(null);
  };

  const editBanner = (b: Banner) => {

    setTitle(b.title);
    setMinOrderAmount(String(b.minOrderAmount));
    setDiscountText(b.discountText);
    setPreview(b.image);
    setIsActive(b.isActive);
    setEditId(b._id);

    window.scrollTo({ top: 0, behavior: "smooth" });

  };

  const deleteBanner = async (id: string) => {

    await axios.delete(`/api/admin/banner/${id}`);

    fetchBanners();

  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">

      <button
  onClick={() => router.back()}
  className="flex items-center gap-2 mb-4 text-green-700 font-semibold"
>
  <IoArrowBack size={20} />
  Back
</button>

      <h2 className="text-2xl font-bold text-green-700">
        {editId ? "Edit Banner" : "Create Banner"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <input
          placeholder="Title"
          className="border p-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Minimum Order ₹"
          className="border p-3 rounded"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
        />

        <input
          placeholder="Discount Text"
          className="border p-3 rounded md:col-span-2"
          value={discountText}
          onChange={(e) => setDiscountText(e.target.value)}
        />

        <label className="border p-3 rounded text-center cursor-pointer md:col-span-2">
          Upload Image
          <input
            type="file"
            className="hidden"
            onChange={handleImage}
          />
        </label>

      </div>

      {preview && (
        <img
          src={preview}
          className="w-full h-40 object-cover rounded"
        />
      )}

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => setIsActive(!isActive)}
        />
        Active Banner
      </label>

      <div className="flex gap-3">

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          {editId ? "Update Banner" : "Save Banner"}
        </button>

        {editId && (
          <button
            onClick={resetForm}
            className="bg-gray-400 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
        )}

      </div>

      {/* Banner List */}

      <div className="grid md:grid-cols-3 gap-4 mt-10">

        {banners.map((b) => (

          <div
            key={b._id}
            className="border p-4 rounded shadow"
          >

            <img
              src={b.image}
              className="w-full h-32 object-cover rounded"
            />

            <h3 className="font-bold mt-2">
              {b.title}
            </h3>

            <p className="text-sm">
              {b.discountText}
            </p>

            <div className="flex gap-2 mt-3">

              <button
                onClick={() => editBanner(b)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteBanner(b._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}