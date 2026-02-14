"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { z } from "zod";



export default function LoginPage() {
  const { setAuth } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("/auth/login", {
        email,
        password,
      });
const result = loginSchema.safeParse({ email, password });

if (!result.success) {
  setError(result.error.issues[0].message);
  return;
}

      setAuth(res.data.user, res.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen items-center justify-center bg-linear-to-br from-blue-100 to-indigo-200">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome Back  
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Login to your account
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-sm text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}
