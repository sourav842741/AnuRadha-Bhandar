"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import {
  MapPin,
  LocateFixed,
  CreditCard,
  Truck,
  User,
  Phone,
  Building,
  Navigation,
  Search,
  Home,
  ArrowLeftCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { clearCart } from "@/redux/cartSlice";

interface Address {
  fullName: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userData);
  const { subtotal, deliveryFee, finalTotal, cartData } = useSelector(
    (state: RootState) => state.cart
  );

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "online">("cod");

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || "",
    phone: user?.mobile || "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  const [mapModules, setMapModules] = useState<any>(null);
  const [markerIcon, setMarkerIcon] = useState<any>(null);

  /* =============================
     LOAD LEAFLET (CLIENT ONLY)
  ============================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    (async () => {
      try {
        const reactLeaflet = await import("react-leaflet");
        const L = await import("leaflet");

        const icon = new L.Icon({
          iconUrl:
            "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        if (!mounted) return;

        setMapModules({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          useMap: reactLeaflet.useMap,
        });

        setMarkerIcon(icon);
      } catch (err) {
        console.error("Map load error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* =============================
     CURRENT LOCATION
  ============================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  /* =============================
     SEARCH LOCATION (DYNAMIC IMPORT)
  ============================== */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (typeof window === "undefined") return;

    try {
      const { OpenStreetMapProvider } = await import(
        "leaflet-geosearch"
      );

      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: searchQuery });

      if (results.length > 0) {
        setPosition([results[0].y, results[0].x]);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  /* =============================
     RAZORPAY SCRIPT LOADER
  ============================== */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);

      if (document.getElementById("razorpay-sdk"))
        return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.id = "razorpay-sdk";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* =============================
     PLACE ORDER
  ============================== */
  const handlePlaceOrder = async () => {
    if (!position) {
      alert("Please select delivery location");
      return;
    }

    try {
      if (paymentMethod === "cod") {
        await axios.post("/api/user/order", {
          userId: user?._id,
          items: cartData,
          totalAmount: finalTotal,
          paymentMethod: "cod",
          address: {
            ...address,
            latitude: position[0],
            longitude: position[1],
          },
        });

        dispatch(clearCart());
        localStorage.removeItem("cart");
        router.push("/user/order-success");
        return;
      }

      // ONLINE
      const amountInPaise = Math.round(finalTotal * 100);

      const { data } = await axios.post(
        "/api/razorpay/create-order",
        { amount: amountInPaise }
      );

      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Failed to load payment gateway");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        handler: async (response: any) => {
          await axios.post("/api/user/order", {
            userId: user?._id,
            items: cartData,
            totalAmount: finalTotal,
            paymentMethod: "online",
            address: {
              ...address,
              latitude: position[0],
              longitude: position[1],
            },
          });

          dispatch(clearCart());
          localStorage.removeItem("cart");
          router.push("/user/order-success");
        },
        theme: { color: "#22c55e" },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Order failed!");
    }
  };

  /* =============================
     UI
  ============================== */
  return (
    <section className="w-[92%] md:w-[80%] mx-auto py-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold text-green-700 text-center mb-8"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Delivery Address
          </h2>

          <textarea
            value={address.fullAddress}
            onChange={(e) =>
              setAddress({ ...address, fullAddress: e.target.value })
            }
            className="w-full border p-3 rounded-lg mb-4"
          />

          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border p-2 rounded-lg"
              placeholder="Search location..."
            />
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-4 rounded-lg"
            >
              Search
            </button>
          </div>

          <div className="mt-4 h-[300px] border rounded-xl overflow-hidden">
            {mapModules && position ? (
              (() => {
                const { MapContainer, TileLayer, Marker } =
                  mapModules;
                return (
                  <MapContainer
                    center={position}
                    zoom={15}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={position}
                      icon={markerIcon}
                    />
                  </MapContainer>
                );
              })()
            ) : (
              <div className="h-full flex items-center justify-center">
                Loading map...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Payment
          </h2>

          <div className="mb-6">
            <button
              onClick={() => setPaymentMethod("cod")}
              className="block w-full border p-3 rounded-lg mb-2"
            >
              Cash on Delivery
            </button>

            <button
              onClick={() => setPaymentMethod("online")}
              className="block w-full border p-3 rounded-lg"
            >
              Pay Online
            </button>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-full"
          >
            Place Order
          </button>
        </div>
      </div>
    </section>
  );
}
