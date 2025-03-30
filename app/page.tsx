"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (result?.ok) {
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/order-list");
      }
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-700">Welcome</h1>
        <p className="text-center text-gray-500 mb-6">Please login to continue</p>
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl mb-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:scale-105 transition"
          >
            <LogIn size={20} />
            Login
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white p-3 rounded-xl hover:scale-105 transition"
          >
            <UserPlus size={20} />
            Register
          </button>
        </form>
      </div>
    </main>
  );
}
