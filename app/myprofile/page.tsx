"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ethers } from "ethers";
import contractConfig from "@/utils/exchangeContract"; // ✅ Import Smart Contract Config
import donatecontractConfig from "@/utils/donateContract";
import ExchangeHis from "./ExchangeHis";
import MyItems from "./MyItem";
import TradeHis from "./TradeHis";

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

interface UserInfo {
  wallet_address: string;
  name: string;
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
  const { data: session, update } = useSession();
  const [ownedItems, setOwnedItems] = useState<Item[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRequest[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    newPassword: "",
    coin: session?.user?.coin ?? 0,
  });
  const [usdValue, setUsdValue] = useState<string | null>(null);
  const [ethValue, setEthValue] = useState<number | null>(null);
  const [usdDonateValue, setUsdDonateValue] = useState<number | null>(0);
  const [ethDonateValue, setEthDonateValue] = useState<number | null>(0);
  const [showExchangeHistory, setShowExchangeHistory] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchItems();
    if (session?.user) {
      setProfileData({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        newPassword: "",
        coin: session.user.coin ?? 0,
      });
    }
  }, [session]);


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
  // ✅ ฟังก์ชันช่วยในการแสดงชื่อผู้ใช้และชื่อสินค้า
  const getUserName = (wallet: string) => {
    const user = users.find((u) => u.wallet_address.toLowerCase() === wallet.toLowerCase());
    return user ? user.name : wallet;
  };
  // ✅ ฟังก์ชันช่วยในการแสดงชื่อสินค้า
  const getItemName = (id: string) => {
    const item = items.find((i) => i._id === id);
    return item ? item.name : id;
  };
  // ✅ ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
  const hasWallet = (wallet: string): boolean => {
    return users.some((u) => u.wallet_address.toLowerCase() === wallet.toLowerCase());
  };
  // ✅ ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้มีสินค้าในระบบหรือไม่
  const hasItem = (id: string, wallet: string): boolean => {
    const item = items.find((i) => i._id === id);
    return item ? item.owner_wallet.toLowerCase() === wallet.toLowerCase() : false;
  };
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
  // ✅ ดึงราคา ETH และคำนวณค่าเงินในกระเป๋า
  const fetchInitialEthPrice = async () => {
      if (session?.user?.wallet_address) {
        try {
          const res = await fetch("/api/ethprice");
          const data = await res.json();
          console.log("ETH Price API response:", data);
          if (!data.ethereum || !data.ethereum.usd) {
            throw new Error("Invalid ETH price data");
          }
          const ethToUsd = data.ethereum.usd * Number(session.user.coin);


          if (!window.ethereum || !session?.user?.wallet_address) return;
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(session.user.wallet_address);
          const ethBalance = ethers.formatEther(balance);

          const res_updatecoin = await fetch("/api/user/updateNamePass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: session?.user?.wallet_address,
              coin: parseFloat(ethBalance),
            }),
          });
    
          if (!res_updatecoin.ok) throw new Error("Update profile failed");
          setEthValue(parseFloat(ethBalance));
          setProfileData((prev) => ({ ...prev, coin: parseFloat(ethBalance) }));
          setUsdValue(ethToUsd.toFixed(2));
        } catch (error) {
          console.error("Failed to fetch ETH price:", error);
          setUsdValue("Error fetching value");
        }
      }
    };

  // ✅ ดึงราคา ETH และ USD จาก Donate
  const fetchDonateEthPrice = async () => {
    if (!session?.user?.wallet_address) return;
    if (typeof window === "undefined" || !window.ethereum) {
        alert("❌ MetaMask not detected. Please install MetaMask.");
        return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        donatecontractConfig.address!,
        donatecontractConfig.abi,
        signer
      );
      const donations = await contract.getDonationsByAddress(session.user.wallet_address);
      let ethSum = 0;
      let usdSum = 0;
      donations.forEach((d: any) => {
        ethSum += parseFloat(ethers.formatEther(d.amount));
        usdSum += Number(d.usdAmount);
      });
      setEthDonateValue(ethSum);
      setUsdDonateValue(usdSum);
    } catch (error) {
      console.error("Failed to fetch ETH price:", error);
      setUsdDonateValue(0);
      setEthDonateValue(0);
    }
  };
  
  useEffect(() => {
    fetchOwnedItems();
    fetchExchangeHistory();
    fetchInitialEthPrice();
    fetchDonateEthPrice();
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
        }

        fetchOwnedItems();
        fetchExchangeHistory();
        alert(`✅ Exchange ${decision}ed successfully with TX: ${txHash}`);
        setExchangeRequests((prev) => prev.filter((req) => req.exchange_id !== exchangeId));
    } catch (error) {
        console.error("❌ Exchange decision failed:", error);
        alert("Exchange decision failed");
    } finally {
        setLoading(false);
    }
};



  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // ✅ อัพเดตข้อมูลโปรไฟล์
  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/user/updateNamePass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: session?.user?.wallet_address,
          name: profileData.name,
          newPassword: profileData.newPassword,
          coin: profileData.coin,
        }),
      });

      if (!res.ok) throw new Error("Update profile failed");

      alert("✅ Profile updated successfully");
      await update(); // รีเฟรช session ที่ client หลังอัพเดต
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Update profile error:", error);
      alert("❌ Failed to update profile");
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
              {isEditingProfile ? (
                <>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled
                        className="border rounded w-full p-2 bg-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="border rounded w-full p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">New Password:</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleProfileChange}
                        className="border rounded w-full p-2"
                      />
                    </div>
                    <p><strong>Coin (ETH):</strong> {profileData.coin}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Email:</strong> {session?.user?.email}</p>
                  <p><strong>Name:</strong> {session?.user?.name}</p>
                  <p><strong>Wallet Address:</strong> {session?.user?.wallet_address}</p>
                  <div className="flex items-center gap-2">
                  <p><strong>Coin (ETH):</strong> { ethValue !== null ? ethValue.toString() : "N/A" }</p>
                    <span className="ml-2 text-gray-600 text-sm">
                      ≈ {usdValue} USD
                    </span>
                  <p><strong>💰ETH Donated:</strong> { ethDonateValue !== null ? ethDonateValue.toString() : "N/A" }</p>
                    <span className="ml-2 text-gray-600 text-sm">
                      ≈ {usdDonateValue} USD
                    </span>
                    <button
                      onClick={()=>fetchInitialEthPrice()}
                      className="px-2 py-1 hover:opacity-80"
                    >
                      <img src="/money.png" alt="Refresh" className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit Name / Password
                    </button>
                  </div>
                </>
              )}
            </div>

  
            {/* ✅ สินค้าที่เป็นเจ้าของ */}
            <MyItems ownedItems={ownedItems} fetchOwnedItems={fetchOwnedItems}/>
            

            {/* ✅ รายการรอการยืนยัน */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2">Pending Exchange Requests</h2>
                {exchangeRequests.length > 0 ? (
                  exchangeRequests.map((request) => {
                    const isValidUser1 = hasWallet(request.user_1_wallet);
                    const isValidUser2 = hasWallet(request.user_2_wallet);
                    const ownsItem1 = hasItem(request.item_1_id, request.user_1_wallet);
                    const ownsItem2 = hasItem(request.item_2_id, request.user_2_wallet);
                    const isExchangeValid = isValidUser1 && isValidUser2 && ownsItem1 && ownsItem2;

                    return (
                      <div key={request.exchange_id} className="border p-4 rounded shadow mb-4">
                        <p><strong>Exchange ID:</strong> {request.exchange_id}</p>
                        <p><strong>From:</strong> {getUserName(request.user_1_wallet)}</p>
                        <p><strong>To:</strong> {getUserName(request.user_2_wallet)}</p>
                        <p><strong>Item Offered:</strong> {getItemName(request.item_1_id)}</p>
                        <p><strong>Requested Item:</strong> {getItemName(request.item_2_id)}</p>
                        <p><strong>Status:</strong> {request.status === 0 ? "Pending" : request.status === 1 ? "Accepted" : "Rejected"}</p>

                        {request.status === 0 && request.user_2_wallet === session?.user?.wallet_address && (
                          <div className="mt-2 flex flex-col gap-2">
                            {isExchangeValid ? (
                              <div className="flex gap-2">
                                <button
                                  className="bg-green-500 text-white p-2 rounded"
                                  onClick={() =>
                                    handleExchangeDecision(
                                      request.exchange_id,
                                      "accept",
                                      request.item_1_id,
                                      request.item_2_id,
                                      request.user_1_wallet,
                                      request.user_2_wallet
                                    )
                                  }
                                  disabled={loading}
                                >
                                  Accept
                                </button>

                                <button
                                  className="bg-red-500 text-white p-2 rounded"
                                  onClick={() =>
                                    handleExchangeDecision(
                                      request.exchange_id,
                                      "reject",
                                      request.item_1_id,
                                      request.item_2_id,
                                      request.user_1_wallet,
                                      request.user_2_wallet
                                    )
                                  }
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-red-500 text-sm font-medium">
                                  *** คุณหรือคนขอแลก ไม่มีบัญชี/สินค้า
                                </p>
                                <button
                                  className="bg-red-500 text-white p-2 rounded"
                                  onClick={() =>
                                    handleExchangeDecision(
                                      request.exchange_id,
                                      "reject",
                                      request.item_1_id,
                                      request.item_2_id,
                                      request.user_1_wallet,
                                      request.user_2_wallet
                                    )
                                  }
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>No pending exchange requests.</p>
                )}

            </div>
        </div>


          {/* Accordion: Exchange History */}
          <div>
            <button
              onClick={() => setShowExchangeHistory(!showExchangeHistory)}
              className="w-full text-left px-6 py-4 font-semibold text-lg hover:bg-gray-100 rounded-xl flex justify-between items-center bg-white shadow"
            >
              Exchange History
              <span>{showExchangeHistory ? "▲" : "▼"}</span>
            </button>

            {/* ✅ ค่อยโชว์คอนเทนต์ตอนคลิก */}
            {showExchangeHistory && (
              <ExchangeHis exchangeHistory={exchangeHistory} />
            )}
          </div>

          {/* Accordion: Trade History */}
          <div >
            <button
              onClick={() => setShowTradeHistory(!showTradeHistory)}
              className="w-full text-left px-6 py-4 font-semibold text-lg hover:bg-gray-100 rounded-xl flex justify-between items-center bg-white shadow"
            >
              Trade History
              <span>{showTradeHistory ? "▲" : "▼"}</span>
            </button>
            {showTradeHistory && (
              <TradeHis walletAddress={session?.user?.wallet_address ?? ""} />
            )}
          </div>
      </div>
    </div>
  );
  
};

export default MyProfile;
