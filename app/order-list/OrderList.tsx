"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface Item {
  _id: string;
  owner_wallet: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/order");
        const data = await res.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">🛍️ Order Management</h2>
        <button
          onClick={() => router.push("/add-item")}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full shadow hover:scale-105 transition flex items-center gap-2"
        >
          <ShoppingBag size={20} />
          Add Product
        </button>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-400">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((item) => (
            <div
              key={item._id}
              className="border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform hover:scale-105 bg-white"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                  ${item.price}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  Owner: {item.owner_wallet}
                </p>
                <button
                  onClick={() => router.push(`/trade?id=${item._id}`)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition"
                >
                  Trade <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
