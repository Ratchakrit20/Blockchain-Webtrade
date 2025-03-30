"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractConfig from "@/utils/exchangeContract"; // ✅ Import Smart Contract Config
import { toast } from "react-toastify";

interface ExchangeRequest {
  exchange_id: number;
  user_1_wallet: string;
  user_2_wallet: string;
  item_1_id: string;
  item_2_id: string;
  timestamp: number;
  transaction_hash: string;
  status: number;
}

interface UserInfo {
  wallet_address: string;
  name: string;
}

interface ItemInfo {
  _id: string;
  name: string;
}


export default function DashExchange() {
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [items, setItems] = useState<ItemInfo[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchUsers(), fetchItems(), fetchExchanges()]);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/user/allUsers");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchItems = async () => {
    const res = await fetch("/api/order");
    const data = await res.json();
    setItems(data.orders || []);
  };

  const fetchExchanges = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
        alert("❌ MetaMask not detected. Please install MetaMask.");
        return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS!, 
        contractConfig.abi, 
        signer);
      const allExchanges: ExchangeRequest[] = await contract.getAllExchanges();
      setExchanges(allExchanges);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถดึงข้อมูล Exchange ได้");
    }
  };

  const getUserName = (wallet: string) => {
    const user = users.find((u) => u.wallet_address.toLowerCase() === wallet.toLowerCase());
    return user ? user.name : wallet;
  };

  const getItemName = (id: string) => {
    const item = items.find((i) => i._id === id);
    return item ? item.name : id;
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("en-GB"); // หรือ th-TH ก็ได้
  };

  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Exchange Requests</h2>
        <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse shadow-md rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
                <tr>
                <th className="px-4 py-3 text-left text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-gray-700">Exchange Requester </th>
                <th className="px-4 py-3 text-left text-gray-700">Exchange Recipient </th>
                <th className="px-4 py-3 text-left text-gray-700">Product Exchange Items </th>
                <th className="px-4 py-3 text-left text-gray-700">Products requested for exchange </th>
                <th className="px-4 py-3 text-center text-gray-700">Status</th>
                <th className="px-4 py-3 text-center">Transaction</th>
                <th className="px-4 py-3 text-center">Time</th>
                </tr>
            </thead>
            <tbody>
                {exchanges.map((ex) => (
                <tr key={ex.exchange_id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{ex.exchange_id}</td>
                    <td className="px-4 py-3">{getUserName(ex.user_1_wallet)}</td>
                    <td className="px-4 py-3">{getUserName(ex.user_2_wallet)}</td>
                    <td className="px-4 py-3">{getItemName(ex.item_1_id)}</td>
                    <td className="px-4 py-3">{getItemName(ex.item_2_id)}</td>
                    <td className="px-4 py-3 text-center">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ex.status == 1
                            ? "bg-green-100 text-green-700"
                            : ex.status == 2
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                        {ex.status == 0
                        ? "Pending"
                        : ex.status == 1
                        ? "Completed"
                        : "Rejected"}
                    </span>
                    </td>
                    <td className="px-4 py-3 text-center max-w-xs break-words">
                    <a
                        href={`https://etherscan.io/tx/${ex.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        {ex.transaction_hash.slice(0, 8)}...{ex.transaction_hash.slice(-6)}
                    </a>
                    </td>
                    <td className="px-4 py-3 text-center">{formatDate(ex.timestamp)}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>

  );
}
