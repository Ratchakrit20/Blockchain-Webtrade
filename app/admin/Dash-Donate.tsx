"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import donatecontractConfig from "@/utils/donateContract";

interface Donation {
  donor: string;
  amount: bigint;
  timestamp: bigint;
  usdAmount: bigint;
  txHash: string; 
}

interface UserInfo {
  wallet_address: string;
  name: string;
}

export default function DashDonate() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [ethTotal, setEthTotal] = useState(0);
  const [usdTotal, setUsdTotal] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);

  const fetchDonations = async () => {
    try {
        if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        donatecontractConfig.address!,
        donatecontractConfig.abi,
        provider
      );
      const rawDonations = await contract.getAllDonations();
      setDonations(rawDonations);

      let ethSum = 0;
      let usdSum = 0;

      rawDonations.forEach((d: Donation) => {
        ethSum += parseFloat(ethers.formatEther(d.amount));
        usdSum += Number(d.usdAmount);
      });

      setEthTotal(ethSum);
      setUsdTotal(usdSum);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
    }
  };

  const fetchEthPrice = async () => {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await res.json();
    setEthPrice(data.ethereum.usd);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/user/allUsers");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const getUserName = (wallet: string) => {
    const user = users.find((u) => u.wallet_address.toLowerCase() === wallet.toLowerCase());
    return user ? user.name : wallet;
  };

  useEffect(() => {
    fetchDonations();
    fetchEthPrice();
    fetchUsers();
  }, []);


  const formatAddress = (addr: string) => addr.slice(0, 6) + "..." + addr.slice(-4);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Donation Dashboard</h1>

      <div className="bg-gray-100 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Total Donations</h2>
        <p className="text-green-700 font-bold text-lg">
          🌿 {ethTotal.toFixed(4)} ETH (~ ${Number(ethTotal * ethPrice).toFixed(2)} USD)
        </p>
        <p className="text-gray-600 text-sm">Reported by users as: ${usdTotal.toFixed(2)} USD</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">All Donations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Donor</th>
              <th className="py-2">ETH</th>
              <th className="py-2">USD</th>
              <th className="py-2">Time</th>
              <th className="py-2">Hash</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{getUserName(d.donor)?? formatAddress(d.donor)}</td>
                <td className="py-2">{parseFloat(ethers.formatEther(d.amount)).toFixed(4)}</td>
                <td className="py-2">${Number(d.usdAmount)}</td>
                <td className="py-2">
                  {new Date(Number(d.timestamp) * 1000).toLocaleString()}
                </td>
                <td className="py-2 break-all text-blue-600">
                  {/* ✅ เพิ่มลิงก์ไปยัง etherscan/sepolia ตามต้องการ */}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {d.txHash.slice(0, 10)}...
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
