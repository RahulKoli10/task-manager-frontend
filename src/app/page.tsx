"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-200 p-6">

      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Task Management Platform
        </h1>

        <p className="text-gray-600 mb-8">
          Production-ready task management system with:
          <br />
          Role-based access, real-time updates, secure authentication,
          pagination, filtering & WebSockets.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl transition"
          >
            Register
          </button>
        </div>
      </div>

      <p className="mt-10 text-sm text-gray-500">
        Built with Next.js + Express + MongoDB + Socket.io
      </p>
    </div>
  );
}
