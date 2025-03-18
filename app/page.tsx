"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
      // ดึงข้อมูล session มาเพื่อตรวจสอบ role
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/order-list");
      }
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>

        <button
          type="button"
          onClick={() => router.push("/register")}
          className="w-full bg-gray-500 text-white p-2 rounded mt-2"
        >
          Register
        </button>
      </form>
    </main>
  );
}
