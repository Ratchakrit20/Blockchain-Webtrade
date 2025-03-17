"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserProvider, formatUnits } from "ethers";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    wallet_address: "",
    coin:0, // เพิ่ม Wallet Address
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  // ฟังก์ชันดึง Wallet Address และยอด ETH จาก MetaMask
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // ✅ ดึงยอด ETH ของ Address นี้
        const balanceWei = await provider.getBalance(address);
        const balanceEth = Number(formatUnits(balanceWei, 18)); // แปลงจาก Wei เป็น ETH

        setFormData((prev) => ({
          ...prev,
          wallet_address: address,
          coin: balanceEth, // ✅ ใส่ค่าลงไปใน formData
        }));

        setWalletConnected(true);
        console.log(`✅ Connected Wallet: ${address}, Balance: ${balanceEth} ETH`);
      } catch (error) {
        console.error("❌ MetaMask Connection Error:", error);
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    // ✅ เช็คว่ามี wallet_address จริง ๆ ก่อนสมัคร
    if (!formData.wallet_address) {
      setError("Please connect your MetaMask wallet before registering.");
      return;
    }
  
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  
    const data = await res.json();
    if (res.status === 201) {
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } else {
      setError(data.message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4">Register</h1>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />
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

        {/* ปุ่มเชื่อมต่อ MetaMask */}
        <button
          type="button"
          onClick={connectWallet}
          className={`w-full p-2 rounded mb-2 ${
            formData.wallet_address ? "bg-green-500 text-white" : "bg-gray-500 text-white"
          }`}
        >
          {formData.wallet_address ? "Wallet Connected ✅" : "Connect MetaMask"}
        </button>

        {/* แสดง Wallet Address */}
        {formData.wallet_address && (
          <p className="text-sm text-gray-600 mb-2">Wallet: {formData.wallet_address}</p>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </main>
  );
}
