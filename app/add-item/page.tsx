"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Wallet, Upload, PlusCircle } from "lucide-react";

const AddItem: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    owner_wallet: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formDataFile = new FormData();
      formDataFile.append("file", file);

      // แสดง preview รูปทันที
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataFile,
      });
      const data = await res.json();

      if (res.status === 201) {
        setFormData((prev) => ({ ...prev, image_url: data.image_url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: Number(formData.price) }),
      });
      const data = await res.json();

      if (res.status === 201) {
        toast.success("Item added successfully!");
        setFormData({ name: "", description: "", price: 0, image_url: "", owner_wallet: "" });
        setImagePreview(null);
      } else {
        toast.error(data.message || "Failed to add item.");
      }
    } catch {
      toast.error("Failed to add item.");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setFormData((prev) => ({ ...prev, owner_wallet: address }));
        toast.success(`Wallet Connected: ${address.slice(0, 6)}...`);
      } catch (error) {
        toast.error("Wallet connection failed.");
      }
    } else {
      toast.error("Please install MetaMask!");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Add New Item</h1>
      <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Product Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price (USD)"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
          />
          <label className="block text-gray-500 text-sm mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-xl cursor-pointer bg-gray-50"
            required
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl mt-2 shadow-md"
            />
          )}

          <button
            type="button"
            onClick={connectWallet}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white p-3 rounded-xl hover:scale-105 transition"
          >
            <Wallet size={20} />
            Connect MetaMask
          </button>
          {formData.owner_wallet && (
            <p className="text-sm text-gray-500 text-center">
              Connected Wallet:{" "}
              <span className="text-indigo-600 font-medium">
                {formData.owner_wallet}
              </span>
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-xl hover:scale-105 transition"
          >
            <PlusCircle size={20} />
            Add Item
          </button>
        </form>
      </div>
    </main>
  );
};

export default AddItem;
