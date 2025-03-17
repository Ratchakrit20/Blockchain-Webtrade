"use client"; // ✅ บอก Next.js ว่าต้องรันบน Client Side

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from './styles/button.module.css'

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
        const res = await fetch("/api/order"); // ✅ เรียก API ที่สร้างขึ้น
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Order List
      <button onClick={() => router.push("/add-item")} className="mb-4">
        <img src="/shopping-bag.png" alt="Add Item" className="w-16 h-16 " />
      </button>
      </h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((item) => (
            <div key={item._id} className="border p-4 rounded shadow">
              <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover mb-2" />
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-blue-500 font-bold">${item.price}</p>
              <p className="text-sm text-gray-400">Owner: {item.owner_wallet}</p>
              <button
                onClick={() => router.push(`/trade?id=${item._id}`)}
                className={styles.button}>
                Trade
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
