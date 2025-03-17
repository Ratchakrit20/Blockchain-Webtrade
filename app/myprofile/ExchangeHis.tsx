"use client";

import React, { useState, useEffect } from "react";

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

interface ExchangeHistoryProps {
  exchangeHistory: ExchangeRequest[];
}

const ExchangeHis: React.FC<ExchangeHistoryProps> = ({ exchangeHistory }) => {
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [walletNames, setWalletNames] = useState<{ [key: string]: string }>({});
  const [itemNames, setItemNames] = useState<{ [key: string]: string }>({});

  const fetchUserName = async (wallet: string) => {
    if (walletNames[wallet]) return;
    try {
      const res = await fetch(`/api/user/${wallet}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setWalletNames((prev) => ({ ...prev, [wallet]: data.name || wallet }));
    } catch (error) {
      console.error("Error fetching user:", error);
      setWalletNames((prev) => ({ ...prev, [wallet]: wallet }));
    }
  };

  const fetchItemName = async (itemId: string) => {
    if (itemNames[itemId]) return;
    try {
      const res = await fetch(`/api/order/${itemId}`);
      if (!res.ok) throw new Error("Item not found");
      const data = await res.json();
      setItemNames((prev) => ({ ...prev, [itemId]: data.name || itemId }));
    } catch (error) {
      console.error("Error fetching item:", error);
      setItemNames((prev) => ({ ...prev, [itemId]: itemId }));
    }
  };

  useEffect(() => {
    if (hoveredText && walletNames[hoveredText]) {
      setHoveredText(walletNames[hoveredText]);
    }
    if (hoveredText && itemNames[hoveredText]) {
      setHoveredText(itemNames[hoveredText]);
    }
  }, [walletNames, itemNames]);

  const handleMouseEnter = async (text: string, type: "wallet" | "item", event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
    setHoveredText(text);

    if (type === "wallet") {
      await fetchUserName(text);
    } else if (type === "item") {
      await fetchItemName(text);
    }
  };

  const handleMouseLeave = () => {
    setHoveredText(null);
  };

  return (
    <div className="relative w-1/3 max-w-sm overflow-hidden">
      <h2 className="text-xl font-bold mb-2">Exchange History</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        {exchangeHistory.length > 0 ? (
          exchangeHistory.map((record) => (
            <div key={record.exchange_id} className="border-b p-4 hover:bg-gray-50 transition-all duration-300 rounded-lg">
              <p className="font-bold">Exchange ID: {record.exchange_id}</p>
  
              {/* From */}
              <p className="font-bold">
                From:
                <span
                  className="text-blue-600 cursor-pointer hover:underline inline-flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-normal"
                  onMouseEnter={(e) => handleMouseEnter(record.user_1_wallet, "wallet", e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {walletNames[record.user_1_wallet] || record.user_1_wallet}
                </span>
              </p>
  
              {/* To */}
              <p className="font-bold">
                To:
                <span
                  className="text-blue-600 cursor-pointer hover:underline inline-flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-normal"
                  onMouseEnter={(e) => handleMouseEnter(record.user_2_wallet, "wallet", e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {walletNames[record.user_2_wallet] || record.user_2_wallet}
                </span>
              </p>
  
              {/* Item Offered */}
              <p className="font-bold">
                Item Offered:
                <span
                  className="text-blue-600 cursor-pointer hover:underline inline-flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-normal"
                  onMouseEnter={(e) => handleMouseEnter(record.item_1_id, "item", e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {itemNames[record.item_1_id] || record.item_1_id}
                </span>
              </p>
  
              {/* Requested Item */}
              <p className="font-bold">
                Requested Item:
                <span
                  className="text-blue-600 cursor-pointer hover:underline inline-flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-normal"
                  onMouseEnter={(e) => handleMouseEnter(record.item_2_id, "item", e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {itemNames[record.item_2_id] || record.item_2_id}
                </span>
              </p>
  
              <p className="font-bold">
                Status: {record.status === 1 ? "✅ Accepted" : record.status === 2 ? "❌ Rejected" : "⏳ Pending"}
              </p>
              <p className="font-bold">
                Transaction Hash:
                <a href={`https://etherscan.io/tx/${record.transaction_hash}`} target="_blank" className="text-blue-500 underline break-words">
                  Click to view hash
                </a>
              </p>
            </div>
          ))
        ) : (
          <p>No exchange history found.</p>
        )}
      </div>
  
      {/* Tooltip */}
      {hoveredText && (
        <div
          className="absolute bg-black text-white text-xs rounded py-1 px-2 shadow-lg whitespace-nowrap"
          style={{ top: tooltipPosition.y, left: tooltipPosition.x, maxWidth: "200px" }}
        >
          {hoveredText}
        </div>
      )}
    </div>
  );
};

export default ExchangeHis;
