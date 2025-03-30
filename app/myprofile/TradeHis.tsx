"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractConfig from "@/utils/tradeContract";
import { motion } from "framer-motion";

interface Trade {
  tradeId: string;
  buyer: string;
  seller: string;
  itemId: string;
  priceUsd: number;
  priceEth: number;
  timestamp: string;
  transactionHash: string;
}

interface TradeHisProps {
  walletAddress: string;
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const TradeHis: React.FC<TradeHisProps> = ({ walletAddress }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [itemNames, setItemNames] = useState<{ [key: string]: string }>({});
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const fetchUserName = async (wallet: string) => {
    if (userNames[wallet]) return;
    try {
      const res = await fetch(`/api/user/${wallet}`);
      const data = await res.json();
      setUserNames((prev) => ({ ...prev, [wallet]: data.name || wallet }));
    } catch (error) {
      setUserNames((prev) => ({ ...prev, [wallet]: wallet }));
    }
  };

  const fetchItemName = async (itemId: string) => {
    if (itemNames[itemId]) return;
    try {
      const res = await fetch(`/api/order/${itemId}`);
      const data = await res.json();
      setItemNames((prev) => ({ ...prev, [itemId]: data.name  }));
    } catch (err) {
      setItemNames((prev) => ({ ...prev, [itemId]: itemId }));
    }
  };

  const fetchTrades = async () => {
    setLoading(true);
    try {
      if (typeof window === "undefined" || !window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS!,
        contractConfig.abi,
        signer
      );
      const allTrades = await contract.getTradesByBuyer(walletAddress);
      const parsedTrades = await Promise.all(
        allTrades.map(async (t: any) => ({
          tradeId: t.tradeId,
          buyer: t.buyer,
          seller: t.seller,
          itemId: t.itemId,
          priceUsd: Number(t.priceUsd),
          priceEth: Number(t.priceEth),
          timestamp: t.timestamp,
          transactionHash: t.transactionHash,
        }))
      );
      setTrades(parsedTrades);

      // Fetch names for buyers, sellers, and items right after loading trades
      const uniqueWallets = new Set(parsedTrades.flatMap((t) => [t.buyer, t.seller]));
      const uniqueItems = new Set(parsedTrades.map((t) => t.itemId));

      await Promise.all(
        Array.from(uniqueWallets).map((wallet) => fetchUserName(wallet))
      );
      await Promise.all(
        Array.from(uniqueItems).map((itemId) => fetchItemName(itemId))
      );
    } catch (error) {
      console.error("Failed to fetch trades: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) fetchTrades();
  }, [walletAddress]);

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-r from-white/80 via-gray-50/80 to-gray-100/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 mt-5">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-700 tracking-wide">
        Trade History
      </h2>
      {loading ? (
        <p className="text-center">Loading trades...</p>
      ) : trades.length === 0 ? (
        <p className="text-center text-gray-500">No trade history found.</p>
      ) : (
        <div className="space-y-6">
          {trades.map((trade, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="rounded-2xl border border-gray-200 shadow-xl bg-white/90 p-5 hover:shadow-2xl transition-all duration-300"
            >
              <p className="text-lg font-bold mb-2 flex items-center gap-2">
                📦 Trade ID: <span className="text-yellow-600">{idx + 1}</span>
              </p>
              <p>
                <strong>Buyer:</strong>{" "}
                <span className="text-blue-700 font-semibold">
                  {userNames[trade.buyer] || "Loading..."}
                </span>
              </p>
              <p>
                <strong>Seller:</strong>{" "}
                <span className="text-purple-700 font-semibold">
                  {userNames[trade.seller] || "Loading..."}
                </span>
              </p>
              <p>
                <strong>Item:</strong>{" "}
                <span className="text-indigo-600 font-semibold">
                  {itemNames[trade.itemId] || trade.itemId.slice(0, 10)}
                </span>
              </p>
              <p>
                <strong>Price:</strong> ${trade.priceUsd} /{" "}
                {ethers.formatEther(trade.priceEth.toString())} ETH
              </p>
              <p className="text-gray-500 text-xs">{formatDate(trade.timestamp)}</p>
              <div className="mt-4">
                <a
                  href={`https://etherscan.io/tx/${trade.transactionHash}`}
                  target="_blank"
                  className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 text-sm transition-all"
                >
                  View on Etherscan
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeHis;
