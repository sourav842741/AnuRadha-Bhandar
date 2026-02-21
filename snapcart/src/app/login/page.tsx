"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import googleImage from "@/assets/google.svg";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/");
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.email.trim() !== "" && form.password.trim() !== "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-green-700 mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Login to continue to your account
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none rounded-xl py-3 pl-10 pr-4 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none rounded-xl py-3 pl-10 pr-10 transition"
            />
            {showPassword ? (
              <EyeOff
                onClick={() => setShowPassword(false)}
                className="absolute right-3 top-3.5 w-5 h-5 cursor-pointer text-gray-500"
              />
            ) : (
              <Eye
                onClick={() => setShowPassword(true)}
                className="absolute right-3 top-3.5 w-5 h-5 cursor-pointer text-gray-500"
              />
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-all ${
              !isFormValid || loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Logging in...
              </>
            ) : (
              <>
                Login
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() =>
              signIn("google", { callbackUrl: "/" })
            }
            className="flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all"
          >
            <Image
              src={googleImage}
              alt="Google"
              width={20}
              height={20}
            />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?
          <Link
            href="/register"
            className="text-green-700 font-semibold ml-1 hover:underline"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

export default Login;