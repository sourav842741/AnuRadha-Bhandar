"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  UserPlus,
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
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-green-700 mb-2"
      >
        Welcome Back
      </motion.h1>

      <motion.form
        onSubmit={handleLogin}
        className="flex flex-col gap-5 w-full max-w-sm"
      >
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border rounded-xl py-3 pl-10 pr-4"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full border rounded-xl py-3 pl-10 pr-10"
          />
          {showPassword ? (
            <EyeOff
              onClick={() => setShowPassword(false)}
              className="absolute right-3 top-3.5 w-5 h-5 cursor-pointer"
            />
          ) : (
            <Eye
              onClick={() => setShowPassword(true)}
              className="absolute right-3 top-3.5 w-5 h-5 cursor-pointer"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="bg-green-600 text-white py-3 rounded-xl"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() =>
            signIn("google", { callbackUrl: "/" })
          }
          className="border py-3 rounded-xl"
        >
          Continue with Google
        </button>
      </motion.form>

      <p className="mt-4">
        Don’t have an account?
        <Link href="/register" className="text-green-700 ml-1">
          Register
        </Link>
      </p>
    </main>
  );
}

export default Login;
