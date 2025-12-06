"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import { OpenStreetMapProvider } from "leaflet-geosearch";
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
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { clearCart } from "@/redux/cartSlice";
 

/**
 * NOTE:
 * We DO NOT import `react-leaflet` or `leaflet` at the top-level
 * because they access `window` during import and break SSR.
 * We'll dynamic-import them at runtime (client-side only).
 */

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

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online" | null>("cod");
  const { subtotal, deliveryFee, finalTotal, cartData } = useSelector(
    (state: RootState) => state.cart
  );

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || "",
    phone: user?.mobile || "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  // mapModules will hold react-leaflet components and leaflet itself once loaded
  const [mapModules, setMapModules] = useState<null | {
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    useMap: any;
    L: any;
  }>(null);

  const [markerIcon, setMarkerIcon] = useState<any>(null);

  // Load Leaflet & react-leaflet on client only
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;
    (async () => {
      try {
        const reactLeaflet = await import("react-leaflet");
        const L = await import("leaflet");

        // create icon after L is available
        const icon = new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        if (!mounted) return;
        setMapModules({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          useMap: reactLeaflet.useMap,
          L,
        });
        setMarkerIcon(icon);
      } catch (err) {
        console.error("Failed to load map libs:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 📍 Accurate Current Location
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // 🗺️ Reverse Geocode (Get City, State, Pincode)
  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
        );
        const data = await res.json();
        if (data?.address) {
          setAddress((prev) => ({
            ...prev,
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            state: data.address.state || "",
            pincode: data.address.postcode || "",
            fullAddress: data.display_name || prev.fullAddress,
          }));
        }
      } catch (err) {
        console.error("Error fetching address:", err);
      }
    };
    fetchAddress();
  }, [position]);

  // 🔍 Search Location
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    if (results.length > 0) {
      setPosition([results[0].y, results[0].x]);
    }
  };

  // DraggableMarker: defined as a component that uses react-leaflet's useMap
  // We create it only when mapModules is ready.
  const DraggableMarker = useMemo(() => {
    if (!mapModules) return null;
    const { Marker, useMap } = mapModules;
    return function InnerDraggableMarker() {
      const map = useMap();
      useEffect(() => {
        if (position) {
          map.setView(position as any, 15, { animate: true });
        }
      }, [position, map]);

      if (!position || !markerIcon) return null;

      return (
        <Marker
          position={position}
          draggable={true}
          icon={markerIcon}
          eventHandlers={{
            dragend: (event: any) => {
              const marker = event.target as any;
              const { lat, lng } = marker.getLatLng();
              setPosition([lat, lng]);
            },
          }}
        />
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapModules, position, markerIcon]);

  // Handle Current Location
  const handleCurrentLocation = () => {
    if (typeof window === "undefined") return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Load Razorpay Script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (document.getElementById("razorpay-sdk")) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.id = "razorpay-sdk";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // handlePlaceOrder (with cart clear)
  const handlePlaceOrder = async () => {
    if (!position) {
      alert("📍 Please allow location access or select a delivery location!");
      return;
    }

    if (!paymentMethod) {
      alert("💳 Please select a payment method!");
      return;
    }

    if (paymentMethod === "cod") {
      try {
        await axios.post("/api/user/order", {
          userId: user?._id,
          items: cartData.map((item) => ({
            product: item._id,
            name: item.name,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: finalTotal,
          paymentMethod: "cod",
          address: {
            fullName: address.fullName,
            phone: address.phone,
            fullAddress: address.fullAddress,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            latitude: position[0],
            longitude: position[1],
          },
        });

        // Clear cart on client after successful order creation
        try {
          dispatch(clearCart());
        } catch (e) {
          console.warn("dispatch clearCart failed:", e);
        }
        try {
          localStorage.removeItem("cart");
        } catch (e) {
          /* ignore */
        }

        router.push("/user/order-success");
      } catch (err) {
        console.log(err);
        alert("Order failed! Try again.");
      }
      return;
    }

    // ONLINE (Razorpay)
    try {
      const amountInPaise = Math.round(finalTotal * 100);
      const { data } = await axios.post("/api/razorpay/create-order", {
        amount: amountInPaise,
      });
      const order = data.order;
      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Failed to load Razorpay SDK");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "AnuRadha Bhandar",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response: any) {
          const verify = await axios.post("/api/razorpay/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (!verify.data.verified) {
            alert("Payment verification failed!");
            return;
          }

          await axios.post("/api/user/order", {
            userId: user?._id,
            items: cartData,
            totalAmount: finalTotal,
            paymentMethod: "online",
            address: {
              fullName: address.fullName,
              phone: address.phone,
              fullAddress: address.fullAddress,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              latitude: position[0],
              longitude: position[1],
            },
            paymentInfo: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
            },
          });

          // Clear cart on client after successful verified payment & order creation
          try {
            dispatch(clearCart());
          } catch (e) {
            console.warn("dispatch clearCart failed:", e);
          }
          try {
            localStorage.removeItem("cart");
          } catch (e) {
            /* ignore */
          }

          router.push("/user/order-success");
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#22c55e",
        },
      };

      // open Razorpay
      // @ts-ignore
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
      alert("Payment failed! Try again.");
    }
  };

  return (
    <section className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/user/cart")}
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
      >
        <ArrowLeftCircle size={28} />
        <span>Back to Cart</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Address + Map */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-600" /> Delivery Address
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-green-600" size={18} />
              <input
                type="text"
                value={address.fullName}
                readOnly
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 text-green-600" size={18} />
              <input
                type="text"
                value={address.phone}
                readOnly
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>

            <div className="relative">
              <Home className="absolute left-3 top-3 text-green-600" size={18} />
              <textarea
                placeholder="Full Address (Building, Street, Area, etc.)"
                value={address.fullAddress}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, fullAddress: e.target.value }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building className="absolute left-3 top-3 text-green-600" size={18} />
                <input
                  type="text"
                  placeholder="City"
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  value={address.city}
                  readOnly
                />
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-3 text-green-600" size={18} />
                <input
                  type="text"
                  placeholder="State"
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  value={address.state}
                  readOnly
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-green-600" size={18} />
                <input
                  type="text"
                  placeholder="Pincode"
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  value={address.pincode}
                  readOnly
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Search city or area..."
                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* MAP */}
          <div className="relative mt-6 h-[330px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
            {mapModules && position ? (
              (() => {
                const { MapContainer, TileLayer } = mapModules;
                const Draggable = DraggableMarker;
                return (
                  <MapContainer
                    center={position as any}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="h-full w-full z-0"
                    key={`${position[0]}_${position[1]}`} // force remount when position changes
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {Draggable ? <Draggable /> : null}
                  </MapContainer>
                );
              })()
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                Loading map...
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCurrentLocation}
              className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-[999]"
              title="Use Current Location"
            >
              <LocateFixed size={22} />
            </motion.button>
          </div>

          {position && (
            <p className="mt-3 text-center text-sm text-gray-700">
              <span className="font-medium">Latitude:</span> {position[0].toFixed(7)}{" "}
              | <span className="font-medium">Longitude:</span> {position[1].toFixed(7)}
            </p>
          )}
        </motion.div>

        {/* PAYMENT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-green-600" /> Payment Method
          </h2>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${
                paymentMethod === "online"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <CreditCard className="text-green-600" />
              <span className="font-medium text-gray-700">Pay Online (Razorpay)</span>
            </button>

            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${
                paymentMethod === "cod"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <Truck className="text-green-600" />
              <span className="font-medium text-gray-700">Cash on Delivery</span>
            </button>
          </div>

          <div className="border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-700 font-semibold">{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span className="text-green-700">₹ {finalTotal}</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold"
            onClick={handlePlaceOrder}
          >
            Place Order
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
