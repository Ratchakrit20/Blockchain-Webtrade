
"use client";

import { useState } from "react";
import { BrowserProvider, parseUnits } from "ethers";
function page() {
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");
    const [transactionHash, setTransactionHash] = useState("");
    const [error, setError] = useState("");

    const handleTransfer = async () => {
        setTransactionHash("");
        setError("");

        if (!window.ethereum) {
        setError("MetaMask not detected!");
        return;
        }

        try {
        // ✅ เชื่อมต่อกับ MetaMask
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();

        // ✅ ส่ง ETH ไปยัง Address ปลายทาง
        const tx = await signer.sendTransaction({
            to: receiver,
            value: parseUnits(amount, "ether"), // แปลง ETH เป็น Wei
        });

        console.log("Transaction Hash:", tx.hash);
        setTransactionHash(tx.hash);
        } catch (err: any) {
        console.error("Transfer Error:", err);
        setError(err.message);
        }
    };
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4">Send ETH</h1>

        {error && <p className="text-red-500">{error}</p>}
        {transactionHash && (
          <p className="text-green-500">
            Transaction Successful!{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              className="text-blue-500 underline"
            >
              View on Etherscan
            </a>
          </p>
        )}

        <input
          type="text"
          placeholder="Receiver Wallet Address"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <button
          onClick={handleTransfer}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Send ETH
        </button>
      </div>
    </main>
  )
}

export default page
