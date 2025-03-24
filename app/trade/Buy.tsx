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
        // Example: Fetch real-time ETH price in USD from CoinGecko API
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
      }
    };

    fetchItem();
    fetchEthPrice();
  }, [itemId]);

  const handleBuyNow = async () => {
    if (!item || !session?.user?.wallet_address || !ethPrice) return;
    const buyerWallet = session.user.wallet_address;

    try {
      // Convert USD price to ETH
      const priceInEth = (item.price / ethPrice).toFixed(6);
      console.log(`Converting ${item.price} USD to ${priceInEth} ETH`);

      // Connect wallet
      if (!window.ethereum) {
        alert("❌ MetaMask not found!");
        return;
        }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Send ETH transaction
      const tx = await signer.sendTransaction({
        to: item.owner_wallet,
        value: ethers.parseEther(priceInEth),
      });

      await tx.wait();
      console.log("Transaction hash:", tx.hash);

      // ✅ ตรวจสอบค่า Smart Contract ก่อนใช้งาน
      if (!tradecontractConfig.abi || !process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS) {
        throw new Error("Smart contract config is missing!");
        }
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS, 
        tradecontractConfig.abi, 
        signer
    );

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

      // Update item ownership in the database
      await fetch(`/api/order/updateOwner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item._id,
          newOwner: buyerWallet,
        }),
      });

      alert("✅ Purchase successful! Ownership updated and trade recorded on blockchain.");
      router.push("/order-list");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("❌ Transaction failed");
    }
  };

  return (
    <div>
      {item ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white shadow-lg rounded-lg p-4 max-w-sm">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="mt-4">
              <h3 className="text-xl font-bold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-blue-500 font-bold text-lg">{item.price} USD</p>
              <p className="text-sm text-gray-400">
                Owner: <span className="font-mono">{item.owner_wallet}</span>
              </p>
              {ethPrice && (
                <p className="text-green-500 text-sm">(≈ {(item.price / ethPrice).toFixed(6)} ETH)</p>
              )}
              <button
                onClick={handleBuyNow}
                className="mt-4 w-full bg-yellow-400 text-black font-bold py-2 rounded-md hover:bg-yellow-500 transition"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading item...</p>
      )}
    </div>
  );
};

export default Buy;
