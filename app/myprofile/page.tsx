"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ethers } from "ethers";
import contractConfig from "@/utils/exchangeContract"; // ✅ Import Smart Contract Config
import ExchangeHis from "./ExchangeHis";

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

interface ExchangeRequest {
  exchange_id: number;
  user_1_wallet: string;
  user_2_wallet: string;
  item_1_id: string;
  item_2_id: string;
  timestamp: number;
  transaction_hash: string;
  status: number; // 0 = pending, 1 = accepted, 2 = rejected
}

const MyProfile: React.FC = () => {
  const { data: session } = useSession();
  const [ownedItems, setOwnedItems] = useState<Item[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRequest[]>([]);

  // ✅ ดึงข้อมูลสินค้าของผู้ใช้
  const fetchOwnedItems = async () => {
        if (!session?.user?.wallet_address) return;
        try {
          const res = await fetch(`/api/order?owner=${session.user.wallet_address}`);
          if (!res.ok) throw new Error("Failed to fetch owned items");
          
          const data = await res.json();
          setOwnedItems(data.orders);
        } catch (error) {
          console.error(error);
        }
      };
  // ✅ ดึงประวัติการทำรายการ
  const fetchExchangeHistory = async () => {
      if (!session?.user?.wallet_address) return;
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
          signer
        );

        const history = await contract.getExchangeHistory(session.user.wallet_address);
        const formattedHistory = history.map((req: any) => ({
          exchange_id: Number(req.exchange_id),
          user_1_wallet: req.user_1_wallet,
          user_2_wallet: req.user_2_wallet,
          item_1_id: req.item_1_id,
          item_2_id: req.item_2_id,
          timestamp: Number(req.timestamp) * 1000,
          transaction_hash: req.transaction_hash,
          status: Number(req.status),
        }));

        setExchangeHistory(formattedHistory);
      } catch (error) {
        console.error("Failed to fetch exchange history:", error);
      }
    };
  
  useEffect(() => {
    fetchOwnedItems();
    fetchExchangeHistory();
  }, [session]);

  // ✅ ดึงรายการขอแลกเปลี่ยนจาก Smart Contract
  useEffect(() => {
    if (!session?.user?.wallet_address) return;

    const fetchExchangeRequests = async () => {
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
          signer
        );

        const requests = await contract.getPendingExchanges(session.user.wallet_address);
        const formattedRequests = requests.map((req: any) => ({
          exchange_id: Number(req.exchange_id),
          user_1_wallet: req.user_1_wallet,
          user_2_wallet: req.user_2_wallet,
          item_1_id: req.item_1_id,
          item_2_id: req.item_2_id,
          timestamp: Number(req.timestamp) * 1000,
          transaction_hash: req.transaction_hash,
          status: Number(req.status), // 0 = pending, 1 = accepted, 2 = rejected
        }));

        setExchangeRequests(formattedRequests);
      } catch (error) {
        console.error("Failed to fetch exchange requests:", error);
      }
    };

    fetchExchangeRequests();
  }, [session]);
  
 

  // ✅ จัดการการยอมรับหรือปฏิเสธการแลกเปลี่ยน และส่งค่า `transaction_hash`
  const handleExchangeDecision = async (exchangeId: number, decision: "accept" | "reject", item_1_id: string, item_2_id: string, user_1_wallet: string, user_2_wallet: string) => {
    if (typeof window === "undefined" || !window.ethereum) {
        alert("❌ MetaMask not detected. Please install MetaMask.");
        return;
    }

    setLoading(true);

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS!,
            contractConfig.abi,
            signer
        );

        console.log("🔍 Debugging Smart Contract Call:");
        console.log("Exchange ID:", exchangeId);
        console.log("Sender Address:", await signer.getAddress());

        // ✅ 1. ทำธุรกรรมยืนยันหรือปฏิเสธ
        let tx;
        if (decision === "accept") {
            console.log("Calling confirmExchange...");
            tx = await contract.confirmExchange(exchangeId);
        } else {
            console.log("Calling rejectExchange...");
            tx = await contract.rejectExchange(exchangeId);
        }

        if (!tx) throw new Error("Transaction failed");

        await tx.wait();
        const txHash = tx.hash; // ✅ ดึง Hash จริงจาก MetaMask

        console.log("✅ Transaction Hash:", txHash);

        // ✅ 2. อัปเดต Hash ใน Smart Contract
        const updateTx = await contract.updateTransactionHash(exchangeId, txHash);
        await updateTx.wait();

        if (decision === "accept") {
          // ✅ อัปเดตเจ้าของสินค้าในฐานข้อมูล
          const res = await fetch("/api/order/updateOwner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              item_1_id,
              item_2_id,
              new_owner_1: user_2_wallet,
              new_owner_2: user_1_wallet
            })
          });
    
          // ✅ ตรวจสอบ response ก่อนแปลง JSON
          if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(`Failed to update owner: ${errorMsg}`);
          }
    
          const data = await res.json();
          console.log("✅ Owner updated:", data);
          fetchOwnedItems();
          fetchExchangeHistory();
        }

        alert(`✅ Exchange ${decision}ed successfully with TX: ${txHash}`);
        setExchangeRequests((prev) => prev.filter((req) => req.exchange_id !== exchangeId));
    } catch (error) {
        console.error("❌ Exchange decision failed:", error);
        alert("Exchange decision failed");
    } finally {
        setLoading(false);
    }
};


return (
    <div className="p-8 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
  
      <div className="flex w-full max-w-6xl gap-6">
        {/* ✅ ด้านซ้าย: Profile และสินค้าของผู้ใช้ */}
        <div className="w-2/3">
            {/* ✅ ข้อมูลโปรไฟล์ */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-2">Profile Information</h2>
                <p><strong>Email:</strong> {session?.user?.email}</p>
                <p><strong>Wallet Address:</strong> {session?.user?.wallet_address}</p>
            </div>
  
            {/* ✅ สินค้าที่เป็นเจ้าของ */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-2">My Items</h2>
                        {ownedItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {ownedItems.map((item) => (
                            <div key={item._id} className="border p-4 rounded shadow">
                                <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded mb-2" />
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm">{item.description}</p>
                                <p className="text-blue-500 font-bold">${item.price}</p>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <p className="text-gray-500">No items found.</p>
                        )}
            </div>

            {/* ✅ รายการรอการยืนยัน */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2">Pending Exchange Requests</h2>
                {exchangeRequests.length > 0 ? (
                exchangeRequests.map((request) => (
                    <div key={request.exchange_id} className="border p-4 rounded shadow mb-4">
                    <p><strong>Exchange ID:</strong> {request.exchange_id}</p>
                    <p><strong>From:</strong> {request.user_1_wallet}</p>
                    <p><strong>To:</strong> {request.user_2_wallet}</p>
                    <p><strong>Item Offered:</strong> {request.item_1_id}</p>
                    <p><strong>Requested Item:</strong> {request.item_2_id}</p>
                    <p><strong>Status:</strong> {request.status === 0 ? "Pending" : request.status === 1 ? "Accepted" : "Rejected"}</p>
    
                    {request.status === 0 && request.user_2_wallet === session?.user?.wallet_address && (
                        <div className="mt-2 flex gap-2">
                        <button
                          className="bg-green-500 text-white p-2 rounded"
                          onClick={() => handleExchangeDecision(request.exchange_id, "accept", request.item_1_id, request.item_2_id, request.user_1_wallet, request.user_2_wallet)}
                          disabled={loading}
                        >
                          Accept
                        </button>

                        <button 
                          className="bg-red-500 text-white p-2 rounded" 
                          onClick={() => handleExchangeDecision(request.exchange_id, "accept", request.item_1_id, request.item_2_id, request.user_1_wallet, request.user_2_wallet)} 
                          disabled={loading}
                        >
                            Reject
                        </button>
                        </div>
                    )}
                    </div>
                ))
                ) : (
                <p>No pending exchange requests.</p>
                )}
            </div>
        </div>
    
            {/* ✅ ด้านขวา: คอมโพเนนต์ Exchange History */}
            <ExchangeHis exchangeHistory={exchangeHistory}/>
      </div>
    </div>
  );
  
};

export default MyProfile;
