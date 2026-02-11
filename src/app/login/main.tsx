"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import BackgroundLeft from "@/assets/images/restoran1.jpg";
// Pastikan path ini sesuai dengan file auth-client kamu
import { saveUser, getUser } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Fix autofill background issue ---
  useEffect(() => {
    const fixAutofillStyles = () => {
      setTimeout(() => {
        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
          if (input.matches(":-webkit-autofill")) {
            input.style.setProperty(
              "-webkit-box-shadow",
              "0 0 0 1000px rgba(0, 0, 0, 0.4) inset",
              "important",
            );
            input.style.setProperty(
              "box-shadow",
              "0 0 0 1000px rgba(0, 0, 0, 0.4) inset",
              "important",
            );
            input.style.setProperty(
              "-webkit-text-fill-color",
              "#f3f4f6",
              "important",
            );
            input.style.setProperty(
              "background-color",
              "transparent",
              "important",
            );
          }
        });
      }, 100);
    };

    fixAutofillStyles();
    window.addEventListener("load", fixAutofillStyles);
    return () => window.removeEventListener("load", fixAutofillStyles);
  }, []);

  // --- Redirect if already logged in ---
  useEffect(() => {
    const user = getUser();
    if (user) {
      const role = user.role || "admin";
      router.replace(`/dashboard/${role}`);
    }
  }, [router]);

  // Di dalam component LoginPage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Mohon isi email dan password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (!result?.user) {
        throw new Error("Login gagal: Data user tidak ditemukan");
      }

      if (result.user.role === "customer") {
        throw new Error("Akses ditolak. Login ini khusus staff.");
      }

      saveUser({
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        fullName: result.user.fullName,
      });

      const role = result.user.role || "admin";
      router.replace(`/dashboard/${role}`);
    } catch (err) {
      // --- PERUBAHAN DISINI ---

      // 1. KITA HAPUS console.error(err)
      // Agar tidak ada log error merah tambahan di console developer.

      // 2. Kita hanya set error ke state untuk Alert UI
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan tak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BackgroundLeft}
          alt="Restaurant interior"
          fill
          className="object-cover opacity-10"
          priority
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] overflow-hidden"
        >
          <div className="px-8 pt-10 pb-6">
            <h6 className="text-2xl font-semibold text-gray-100 text-center">
              Login
            </h6>
          </div>

          <div className="px-8 pt-4 pb-10">
            {/* --- COMPONENT ALERT SHADCN --- */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-red-900/20 border border-red-600/30 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <AlertDescription className="text-red-300 text-sm">
                      {error}
                    </AlertDescription>
                  </div>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="space-y-4">
                <Label
                  htmlFor="email"
                  className="text-gray-300 text-sm font-medium block mb-2"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-gray-300 ml-1" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="staff@example.com"
                    className="pl-9 pr-4 h-12 bg-transparent border-0 border-b border-white/20 text-gray-100 placeholder:text-gray-500 
                             focus:outline-none focus:ring-0 focus:border-b-2 focus:border-white/40
                             transition-all duration-200 rounded-none
                             [&:-webkit-autofill]:!bg-transparent
                             [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_rgba(0,0,0,0.4)_inset]
                             [&:-webkit-autofill]:![-webkit-text-fill-color:#f3f4f6]
                             [&:-webkit-autofill]:![-webkit-background-clip:text]"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-gray-300 text-sm font-medium block"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-gray-300 ml-1" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-12 bg-transparent border-0 border-b border-white/20 text-gray-100 placeholder:text-gray-500
                             focus:outline-none focus:ring-0 focus:border-b-2 focus:border-white/40
                             transition-all duration-200 rounded-none
                             [&:-webkit-autofill]:!bg-transparent
                             [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_rgba(0,0,0,0.4)_inset]
                             [&:-webkit-autofill]:![-webkit-text-fill-color:#f3f4f6]
                             [&:-webkit-autofill]:![-webkit-background-clip:text]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-white/10 hover:bg-white/20 border border-white/10 
                           text-gray-100 font-medium rounded-lg shadow-lg shadow-black/40 
                           transition-all backdrop-blur-xl mt-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      <span>Login to Dashboard</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Guest Customer Option */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Are you a customer?
                </p>
                <Button
                  type="button"
                  onClick={() => router.push("/dashboard/customer")}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  className="text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 
                           transition-all px-3 py-2 h-auto disabled:opacity-50 disabled:cursor-not-allowed !gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3 mr-1" />
                  Continue as Guest Customer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <div className="w-32 h-32 rounded-full border border-white/10" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <div className="w-24 h-24 rounded-full border border-white/10" />
      </div>
    </div>
  );
}

export const login = async (identifier: string, password: string) => {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Login failed");
  }

  return data;
};
