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
      // if (!res.ok) throw new Error("Item not found");
      const data = await res.json();
      setItemNames((prev) => ({ ...prev, [itemId]: data.name || itemId }));
    } catch (error) {
      console.error("Error fetching item:", error);
      setItemNames((prev) => ({ ...prev, [itemId]: itemId }));
    }
  };

  useEffect(() => {
    const loadAllNames = async () => {
      const walletSet = new Set<string>();
      const itemSet = new Set<string>();
  
      exchangeHistory.forEach((record) => {
        walletSet.add(record.user_1_wallet);
        walletSet.add(record.user_2_wallet);
        itemSet.add(record.item_1_id);
        itemSet.add(record.item_2_id);
      });
  
      await Promise.all(Array.from(walletSet).map((wallet) => fetchUserName(wallet)));
      await Promise.all(Array.from(itemSet).map((itemId) => fetchItemName(itemId)));

    };
  
    if (exchangeHistory.length > 0) {
      loadAllNames();
    }
  }, [exchangeHistory]);

  return (
    <div className="relative w-full max-w-xl mx-auto bg-gradient-to-r from-white/80 via-gray-50/80 to-gray-100/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mt-5">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-700 tracking-wide">
        Exchange History
      </h2>
  
      {exchangeHistory.length > 0 ? (
        <div className="space-y-6">
          {exchangeHistory.map((record) => (
            <div
              key={record.exchange_id}
              className="rounded-2xl border border-gray-200 shadow-xl bg-white/90 p-5 hover:shadow-2xl transition-all duration-300"
            >
              {/* แสดงเฉพาะ Exchange ID */}
              <p className="text-lg font-bold mb-2 flex items-center gap-2">
                📜 Exchange ID: <span className="text-yellow-600">{record.exchange_id}</span>
              </p>
  
              {/* โชว์ชื่อผู้ส่งและผู้รับ แทน address */}
              <p>
                <strong>From:</strong>{" "}
                <span className="text-blue-700 font-semibold">
                  {walletNames[record.user_1_wallet]}
                </span>
              </p>
              <p>
                <strong>To:</strong>{" "}
                <span className="text-indigo-600 font-semibold">
                  {walletNames[record.user_2_wallet]}
                </span>
              </p>
  
              {/* โชว์ชื่อสินค้าแทน item id */}
              <p>
                <strong>Item Offered:</strong>{" "}
                <span className="text-blue-700 font-semibold">
                  {itemNames[record.item_1_id]}
                </span>
              </p>
              <p>
                <strong>Requested Item:</strong>{" "}
                <span className="text-indigo-600 font-semibold">
                  {itemNames[record.item_2_id]}
                </span>
              </p>
  
              {/* Status ในรูปแบบ badge สวยงาม */}
              <div className="mt-3 flex items-center gap-2">
                <strong>Status:</strong>
                {record.status === 1 && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    ✅ Accepted
                  </span>
                )}
                {record.status === 2 && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    ❌ Rejected
                  </span>
                )}
                {record.status === 0 && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    ⏳ Pending
                  </span>
                )}
              </div>
  
              {/* ปุ่ม View on Etherscan สไตล์สวยๆ */}
              <div className="mt-4">
                <a
                  href={`https://etherscan.io/tx/${record.transaction_hash}`}
                  target="_blank"
                  className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 text-sm transition-all"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No exchange history found.</p>
      )}
  
      
    </div>
  );
  
};

export default ExchangeHis;
