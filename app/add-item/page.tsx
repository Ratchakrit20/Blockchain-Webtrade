"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const AddItem: React.FC = () => {
  const [error, setError] = useState("");
  const [Success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    owner_wallet: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
  
    if (type === "file" && files && files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(files[0]); // ✅ อ่านไฟล์เป็น url
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          image_url: reader.result as string, // ✅ เก็บค่า url ลง state
        }));
      };
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
  
      const formData = new FormData();
      formData.append("file", file);
  
      console.log("🚀 Uploading Image:", file.name); // ✅ ตรวจสอบไฟล์ที่กำลังอัปโหลด
  
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      console.log("✅ Upload Response:", data); // ✅ ตรวจสอบค่าที่ API ส่งกลับมา
  
      if (res.status === 201) {
        setFormData((prev) => ({ ...prev, image_url: data.image_url })); // ✅ บันทึก URL
      } else {
        setError("Failed to upload image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    console.log("🚀 Sending Data:", formData); // ✅ ตรวจสอบค่าที่กำลังส่งไป API
  
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price), // ✅ แปลง `price` เป็นตัวเลข
        }),
      });
  
      const data = await res.json();
      if (res.status === 201) {
        setSuccess("Item added successfully!");
        setFormData({ name: "", description: "", price: 0, image_url: "", owner_wallet: "" });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to add item.");
    }
  };

  // ดึง Wallet Address จาก MetaMask
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setFormData((prev) => ({
          ...prev,
          owner_wallet: address,
        }));

        console.log("✅ Connected Wallet:", address);
      } catch (error) {
        console.error("❌ MetaMask Connection Error:", error);
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask.");
    }
  };
  

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Add Item</h1>
        <div className="p-4 border rounded shadow-md w-96">
          <h2 className="text-xl font-bold mb-4">New Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Item Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <button
              type="button"
              onClick={connectWallet}
              className="w-full bg-gray-500 text-white p-2 rounded mb-2"
            >
              Connect MetaMask
            </button>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Add Item
            </button>
            <p>{Success}</p>
          </form>
        </div>
      </main>
  );
};

export default AddItem;
