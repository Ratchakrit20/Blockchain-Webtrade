"use client";
import { useEffect, useState } from "react";
import { ethers, Log } from "ethers";
import donatecontractConfig from "@/utils/donateContract";
import { TreeDeciduous } from "lucide-react";

export default function DonatePage() {
  const [usd, setUsd] = useState("");
  const [eth, setEth] = useState("0");
  const [rate, setRate] = useState(0);
  const [txHash, setTxHash] = useState("");

  // exchange rate for ETH/USD
  useEffect(() => {
    async function fetchEthPrice() {
      try {
        const res = await fetch(
          "/api/ethprice"
        );
        const data = await res.json();
        const ethPrice = data.ethereum.usd;
        setRate(ethPrice);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
      }
    }
  
    fetchEthPrice();
  
    // Refresh price every 1 minute (optional)
    const interval = setInterval(fetchEthPrice, 60000);
  
    return () => clearInterval(interval); // Cleanup
  }, []);

  // Convert USD to ETH whenever USD changes
  useEffect(() => {
    if (!usd || isNaN(+usd)) {
      setEth("0");
      return;
    }
    const ethAmount = (+usd / rate).toFixed(6);
    setEth(ethAmount);
  }, [usd, rate]);

  const handleDonate = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        donatecontractConfig.address!,
        donatecontractConfig.abi,
        signer
      );

      const tx = await contract.donate(+usd, {
        value: ethers.parseEther(eth),
      });

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      // 👉 จากนั้นเรียกฟังก์ชัน registerTxHash เพื่อบันทึก hash จริงเข้า Smart Contract
      await contract.registerTxHash(receipt.hash);
      // 🔍 ตรวจจับ DonationReceived event
      // let foundEvent = null;

      // for (const log of receipt.logs as Log[]) {
      //   try {
      //     const parsed = contract.interface.parseLog(log);
      //     if (parsed && parsed.name === "DonationReceived") {
      //       foundEvent = parsed;
      //       break;
      //     }
      //   } catch (e) {
      //     // ไม่ต้องทำอะไร เพราะ log นี้อาจไม่ใช่ event ของ contract นี้
      //   }
      // }

      // if (foundEvent) {
      //   console.log("🎉 Event received:", foundEvent);
      //   alert(
      //     `🎉 Donation Event:\nDonor: ${foundEvent.args.donor}\nAmount: ${ethers.formatEther(
      //       foundEvent.args.amount
      //     )} ETH\nUSD: $${foundEvent.args.usdAmount}`
      //   );
      // } else {
      //   console.log("⚠️ No DonationReceived event found in logs");
      // }
    } catch (error) {
      console.error("Donation failed:", error);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <div className="flex justify-center mb-4">
        <TreeDeciduous size={48} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-green-700">
        Donate ETH 💖 to Plant Trees 🌳
      </h1>
      <p className="text-gray-600 mb-6">
        Help us reduce carbon by supporting our reforestation project.
      </p>

      <input
        type="number"
        placeholder="Amount in USD"
        value={usd}
        onChange={(e) => setUsd(e.target.value)}
        className="border rounded px-4 py-2 w-full mb-3 text-center"
      />

      <p className="text-sm text-gray-500 mb-4">
        ≈ {eth} ETH @ {rate} USD/ETH
      </p>

      <button
        onClick={handleDonate}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
      >
        Donate 🌱
      </button>

      {txHash && (
        <p className="mt-4 text-green-700 break-words text-sm">
          ✅ Thank you! Tx: {txHash}
        </p>
      )}
    </div>
  );
}
