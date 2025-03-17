"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ethers } from "ethers";
import contractConfig from "../../utils/exchangeContract"; // ✅ Import Smart Contract ABI

interface ExchangeProps {
    itemId: string | null;
}

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

const Exchange: React.FC<ExchangeProps> = ({ itemId }) => {
    const [item, setItem] = useState<Item | null>(null);
    const [userItems, setUserItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

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

        fetchItem();
    }, [itemId]);

    useEffect(() => {
        if (!session?.user?.wallet_address) return;

        const fetchUserItems = async () => {
            try {
                const res = await fetch(`/api/order?owner=${session.user.wallet_address}`);
                if (!res.ok) throw new Error("Failed to fetch user items");

                const data = await res.json();
                setUserItems(data.orders);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserItems();
    }, [session]);

    // ✅ ฟังก์ชันขอแลกเปลี่ยน
    const handleExchangeRequest = async () => {
        if (!selectedItem || !item) return;
        setLoading(true);

        try {
            if (!window.ethereum) {
                alert("❌ MetaMask not found!");
                return;
            }

            // ✅ ตั้งค่าการเชื่อมต่อ Ethereum Provider
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // ✅ ตรวจสอบค่า Smart Contract ก่อนใช้งาน
            if (!contractConfig.abi || !process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS) {
                throw new Error("Smart contract config is missing!");
            }

            // ✅ ใช้เฉพาะ `abi` ในการเชื่อมต่อ Smart Contract
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS,
                contractConfig.abi, // ✅ ใช้ `abi` เท่านั้น
                signer
            );

            // ✅ ส่งธุรกรรมไปยัง Smart Contract
            const tx = await contract.requestExchange(
                item.owner_wallet, // user_2_wallet
                selectedItem._id, // item_1_id
                item._id // item_2_id
            );

            await tx.wait();
            console.log("🔗 Transaction Hash:", tx.hash); // ✅ ดึงค่า `_transaction_hash`

            alert("✅ Exchange request sent to blockchain!");
        } catch (error) {
            console.error(error);
            alert("❌ Exchange request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-row items-start justify-center min-h-screen p-8 gap-6">
            {/* ✅ ฝั่งซ้าย: แสดงสินค้าที่ต้องการแลก */}
            <div className="bg-white shadow-lg rounded-lg p-4 max-w-md">
                {item ? (
                    <>
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-md"
                        />
                        <div className="mt-4">
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <p className="text-gray-600">{item.description}</p>
                            <p className="text-blue-500 font-bold text-lg">${item.price}</p>
                            <p className="text-sm text-gray-400">
                                Owner: <span className="font-mono">{item.owner_wallet}</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <p>Loading item...</p>
                )}
            </div>

            {/* ✅ ฝั่งขวา: เลือกสินค้า */}
            <div className="bg-white shadow-lg rounded-lg p-4 max-w-md w-full">
                <h4 className="text-lg font-bold mb-2">Select Item to Exchange:</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {userItems.map((userItem) => (
                        <button
                            key={userItem._id}
                            className={`p-2 border rounded w-full flex flex-col items-center ${
                                selectedItem?._id === userItem._id ? "bg-blue-400 text-white" : "bg-gray-100"
                            }`}
                            onClick={() => setSelectedItem(userItem)}
                        >
                            <img
                                src={userItem.image_url}
                                alt={userItem.name}
                                className="w-16 h-16 object-cover rounded"
                            />
                            <p className="text-sm">{userItem.name}</p>
                        </button>
                    ))}
                </div>

                {/* ✅ แสดงสินค้าที่เลือก */}
                {selectedItem && (
                    <div className="mt-4 p-4 border rounded bg-gray-100">
                        <h4 className="text-lg font-bold">Selected Item:</h4>
                        <img
                            src={selectedItem.image_url}
                            alt={selectedItem.name}
                            className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-sm font-bold">{selectedItem.name}</p>
                    </div>
                )}

                <button
                    className={`mt-4 w-full bg-yellow-400 text-black font-bold py-2 rounded-md ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-500 transition"
                    }`}
                    onClick={handleExchangeRequest}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Request Exchange"}
                </button>
            </div>
        </div>
    );
};

export default Exchange;
