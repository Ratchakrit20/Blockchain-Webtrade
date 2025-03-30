"use client";

import React, { useEffect, useState } from "react";
import { ethers, formatEther } from "ethers";
import tradecontractConfig from "../../utils/tradeContract";
import { toast } from "react-toastify";

interface Trade {
  tradeId: string;
  buyer: string;
  seller: string;
  itemId: string;
  priceUsd: string;
  priceEth: string;
  timestamp: string;
  transactionHash: string;
}

interface UserInfo {
  wallet_address: string;
  name: string;
}

interface ItemInfo {
  _id: string;
  name: string;
}


export default function DashTrade() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [items, setItems] = useState<ItemInfo[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchUsers(), fetchItems(), fetchTrades()]);
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

  const fetchTrades = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
        alert("❌ MetaMask not detected. Please install MetaMask.");
        return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS!, 
        tradecontractConfig.abi, 
        signer);
      const allTrades: Trade[] = await contract.getAllTrades();
      setTrades(allTrades);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถดึงข้อมูล Trade ได้");
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

  const formatEth = (wei: string) => {
    try {
      return formatEther(wei);
    } catch {
      return wei;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Trade History</h2>
        <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse shadow-xl rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
                <tr>
                <th className="px-4 py-3 text-center">Trade ID</th>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-right">Price (USD)</th>
                <th className="px-4 py-3 text-right">Price (ETH)</th>
                <th className="px-4 py-3 text-center">Time</th>
                <th className="px-4 py-3 text-center">Transaction</th>
                </tr>
            </thead>
            <tbody>
                {trades.map((trade, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-center">{index + 1}</td>
                    <td className="px-4 py-3">{getUserName(trade.buyer)}</td>
                    <td className="px-4 py-3">{getUserName(trade.seller)}</td>
                    <td className="px-4 py-3">{getItemName(trade.itemId)}</td>
                    <td className="px-4 py-3 text-right">${trade.priceUsd}</td>
                    <td className="px-4 py-3 text-right">{formatEth(trade.priceEth)} ETH</td>
                    <td className="px-4 py-3 text-center">{formatTime(trade.timestamp)}</td>
                    <td className="px-4 py-3 text-center max-w-xs break-words">
                    <a
                        href={`https://etherscan.io/tx/${trade.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        {trade.transactionHash.slice(0, 8)}...{trade.transactionHash.slice(-6)}
                    </a>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
}
