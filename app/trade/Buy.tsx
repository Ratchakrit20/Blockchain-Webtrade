"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useSession } from "next-auth/react";
import tradecontractConfig from "../../utils/tradeContract";
import { useRouter } from "next/navigation";

interface BuyProps {
  itemId: string | null;
}

interface Item {
  _id: string;
  owner_wallet: string;
  name: string;
  description: string;
  price: number; // Price in USD
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

const Buy: React.FC<BuyProps> = ({ itemId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  // ✅ ดึงข้อมูลสินค้าและราคา ETH จาก API เมื่อโหลดหน้า
  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/order/${itemId}`);
        if (!res.ok) throw new Error("Failed to fetch item");
        const data = await res.json();
        setItem(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchEthPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
      }
    };

    fetchItem();
    fetchEthPrice();
  }, [itemId]);

  // ✅ ฟังก์ชันสำหรับดำเนินการสั่งซื้อและบันทึกข้อมูลการซื้อบน Blockchain
  const handleBuyNow = async () => {
    if (!item || !session?.user?.wallet_address || !ethPrice) return;
    const buyerWallet = session.user.wallet_address;

    try {
      // ✅ แปลง USD เป็น ETH
      const priceInEth = (item.price / ethPrice).toFixed(6);
      console.log(`Converting ${item.price} USD to ${priceInEth} ETH`);

      // ✅ เชื่อมต่อ MetaMask wallet
      if (!window.ethereum) {
        alert("❌ MetaMask not found!");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✅ ส่ง ETH ไปยังเจ้าของสินค้า
      const tx = await signer.sendTransaction({
        to: item.owner_wallet,
        value: ethers.parseEther(priceInEth),
      });

      await tx.wait();
      console.log("Transaction hash:", tx.hash);

      // ✅ เชื่อมต่อ Smart Contract สำหรับบันทึกข้อมูลการซื้อ
      if (!tradecontractConfig.abi || !process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS) {
        throw new Error("Smart contract config is missing!");
      }
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS,
        tradecontractConfig.abi,
        signer
      );

      // ✅ เรียก recordTrade() เพื่อบันทึกธุรกรรมลง blockchain
      await contract.recordTrade(
        tx.hash,
        buyerWallet,
        item.owner_wallet,
        item._id,
        ethers.parseUnits(item.price.toString(), 0),
        ethers.parseEther(priceInEth),
        new Date().toISOString(),
        tx.hash
      );

      // ✅ อัปเดตเจ้าของใน database หลังซื้อสำเร็จ
      await fetch(`/api/order/updateOwner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item._id,
          newOwner: buyerWallet,
        }),
      });

      alert("✅ Purchase successful! Ownership updated and trade recorded.");
      router.push("/order-list");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("❌ Transaction failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-l-screen bg-gradient-to-br from-gray-90 to-white p-4">
      {item ? (
        <div className="bg-white shadow-2xl rounded-3xl p-6 max-w-sm w-full transition hover:scale-[1.02]">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-60 object-cover rounded-xl shadow"
          />
          <div className="mt-5">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.name}</h3>
            <p className="text-gray-500 mb-2">{item.description}</p>
            <p className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text">
              {item.price} USD
            </p>
            <p className="text-xs text-gray-400 mt-1 truncate">
              Owner: {item.owner_wallet}
            </p>
            {ethPrice && (
              <p className="text-green-500 text-sm mt-2">
                (≈ {(item.price / ethPrice).toFixed(6)} ETH)
              </p>
            )}
            <button
              onClick={handleBuyNow}
              className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 rounded-2xl text-lg shadow hover:scale-105 transition"
            >
              BUY NOW
            </button>
          </div>
        </div>
      ) : (
        <p>Loading item...</p>
      )}
    </div>
  );
};

export default Buy;
