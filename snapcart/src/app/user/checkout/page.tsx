"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
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

  /* ================= REVERSE GEOCODE ================= */
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
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
          fullAddress: data.display_name || "",
        }));
      }
    } catch (err) {
      console.log("Reverse geocode error", err);
    }
  };

  /* ================= MAP LOAD ================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    (async () => {
      const reactLeaflet = await import("react-leaflet");
      const L = await import("leaflet");

      const icon = new L.Icon({
        iconUrl:
          "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [35, 35],
        iconAnchor: [17, 35],
      });

      if (!mounted) return;

      setMapModules({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        useMapEvents: reactLeaflet.useMapEvents,
      });

      setMarkerIcon(icon);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= CURRENT LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setPosition([lat, lon]);
        await reverseGeocode(lat, lon);
      },
      async () => {
        const lat = 22.5726;
        const lon = 88.3639;
        setPosition([lat, lon]);
        await reverseGeocode(lat, lon);
      }
    );
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const { OpenStreetMapProvider } = await import("leaflet-geosearch");
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });

    if (results.length > 0) {
      const lat = results[0].y;
      const lon = results[0].x;
      setPosition([lat, lon]);
      await reverseGeocode(lat, lon);
    }
  };

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!user?._id) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    if (!position) {
      alert("Select delivery location");
      return;
    }

    if (!address.fullAddress || !address.phone) {
      alert("Fill complete address");
      return;
    }

    try {
      await axios.post("/api/user/order", {
        userId: user._id,
        items: cartData,
        totalAmount: finalTotal,
        paymentMethod,
        address: {
          ...address,
          latitude: position[0],
          longitude: position[1],
        },
      });

      dispatch(clearCart());
      localStorage.removeItem("cart");
      router.push("/user/order-success");
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      alert("Order failed");
    }
  };

  /* ================= MAP CLICK HANDLER ================= */
  const MapClickHandler = () => {
    const map = mapModules.useMapEvents({
      click: async (e: any) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        setPosition([lat, lon]);
        await reverseGeocode(lat, lon);
      },
    });
    return null;
  };

  /* ================= UI ================= */
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
            placeholder="Full Address"
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
              <mapModules.MapContainer
                center={position}
                zoom={15}
                className="h-full w-full"
              >
                <mapModules.TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <mapModules.Marker
                  position={position}
                  icon={markerIcon}
                  draggable
                  eventHandlers={{
                    dragend: async (e: any) => {
                      const lat = e.target.getLatLng().lat;
                      const lon = e.target.getLatLng().lng;
                      setPosition([lat, lon]);
                      await reverseGeocode(lat, lon);
                    },
                  }}
                />
                <MapClickHandler />
              </mapModules.MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                Loading map...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>

          <button
            onClick={() => setPaymentMethod("cod")}
            className={`w-full p-3 rounded-lg mb-2 border ${
              paymentMethod === "cod"
                ? "bg-green-600 text-white"
                : "bg-white"
            }`}
          >
            Cash on Delivery
          </button>

          <button
            onClick={() => setPaymentMethod("online")}
            className={`w-full p-3 rounded-lg border ${
              paymentMethod === "online"
                ? "bg-green-600 text-white"
                : "bg-white"
            }`}
          >
            Pay Online
          </button>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between">
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