"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, RefreshCw } from "lucide-react";

interface LocationDetectorProps {
  onLocationDetected?: (address: string, lat: number, lng: number) => void;
  onLocationUpdate?: (address: string) => void;
}

interface GeocodingResult {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

export default function LocationDetector({ onLocationDetected, onLocationUpdate }: LocationDetectorProps) {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Function to reverse geocode coordinates to address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AnuradhaBhandar/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to geocode location");
      }

      const data: GeocodingResult = await response.json();
      
      // Format the address nicely
      if (data.address) {
        const { house_number, road, city, town, village, state, postcode } = data.address;
        
        // Build a short address
        const parts: string[] = [];
        
        if (road) parts.push(road);
        if (house_number) parts.push(house_number);
        
        const cityName = city || town || village;
        if (cityName) parts.push(cityName);
        if (postcode) parts.push(postcode);
        
        if (parts.length > 0) {
          return parts.join(", ");
        }
      }
      
      // Fallback to display_name if address parsing fails
      return data.display_name?.split(",").slice(0, 3).join(", ") || "Unknown location";
    } catch (err) {
      console.error("Geocoding error:", err);
      return "Location detected";
    }
  };

  // Function to detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        try {
          const detectedAddress = await reverseGeocode(latitude, longitude);
          setAddress(detectedAddress);
          
          // Call callbacks
          if (onLocationDetected) {
            onLocationDetected(detectedAddress, latitude, longitude);
          }
          if (onLocationUpdate) {
            onLocationUpdate(detectedAddress);
          }
          
          // Store in localStorage for persistence
          localStorage.setItem("userLocation", JSON.stringify({
            address: detectedAddress,
            lat: latitude,
            lng: longitude
          }));
        } catch (err) {
          setError("Failed to get address from coordinates");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable");
            break;
          case err.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError("An unknown error occurred");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  // Check for saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setAddress(parsed.address);
        setCoordinates({ lat: parsed.lat, lng: parsed.lng });
      } catch (err) {
        // Invalid stored data, try to detect fresh location
        detectLocation();
      }
    } else {
      // Auto-detect on first visit
      detectLocation();
    }
  }, []);

  // If there's no address and not loading, show button to detect
  if (!address && !loading && !error) {
    return (
      <button
        onClick={detectLocation}
        className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span>Add Delivery Address</span>
      </button>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/90 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Detecting location...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <button
        onClick={detectLocation}
        className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span>Add Delivery Address</span>
      </button>
    );
  }

  // Show detected address with refresh option
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-white text-sm max-w-[200px]">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        <span className="truncate" title={address}>
          {address}
        </span>
      </div>
      <button
        onClick={detectLocation}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
        title="Update location"
      >
        <RefreshCw className="w-3 h-3 text-white/70" />
      </button>
    </div>
  );
}

// Helper hook to use location in other components
export function useLocation() {
  const [location, setLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing saved location:", err);
      }
    }
  }, []);

  const updateLocation = (address: string, lat: number, lng: number) => {
    const newLocation = { address, lat, lng };
    setLocation(newLocation);
    localStorage.setItem("userLocation", JSON.stringify(newLocation));
  };

  return { location, updateLocation };
}

