"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserProvider, formatUnits } from "ethers";
import { toast } from "react-toastify";
import { Wallet, UserPlus } from "lucide-react";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    wallet_address: "",
    coin: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balanceWei = await provider.getBalance(address);
        const balanceEth = Number(formatUnits(balanceWei, 18));

        setFormData((prev) => ({
          ...prev,
          wallet_address: address,
          coin: balanceEth,
        }));

        toast.success(`Connected: ${address.slice(0, 6)}... (${balanceEth.toFixed(3)} ETH)`);
      } catch (error) {
        toast.error("MetaMask connection failed.");
      }
    } else {
      toast.error("MetaMask not detected. Please install it.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.wallet_address) {
      toast.error("Please connect your MetaMask wallet first.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.status === 201) {
      toast.success("Registration successful! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } else {
      toast.error(data.message || "Registration failed.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-2">Create Your Account</h1>
        <p className="text-center text-gray-500 mb-6">Sign up to get started with trading</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
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
            type="button"
            onClick={connectWallet}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition hover:scale-105 ${
              formData.wallet_address
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : "bg-gradient-to-r from-gray-500 to-gray-700 text-white"
            }`}
          >
            <Wallet size={20} />
            {formData.wallet_address ? "Wallet Connected" : "Connect MetaMask"}
          </button>

          {formData.wallet_address && (
            <div className="text-center text-sm text-gray-600 mt-1">
              Wallet Address:{" "}
              <span className="text-indigo-600 font-medium">
                {formData.wallet_address}
              </span>
              <div className="text-xs text-gray-500">
                Balance: {formData.coin.toFixed(4)} ETH
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl hover:scale-105 transition"
          >
            <UserPlus size={20} />
            Register
          </button>
        </form>
      </div>
    </main>
  );
}
