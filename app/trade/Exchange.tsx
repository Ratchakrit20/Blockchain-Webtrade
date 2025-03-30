"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ethers } from "ethers";
import contractConfig from "../../utils/exchangeContract";

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

    // ✅ ดึงข้อมูลสินค้าที่ต้องการแลกเปลี่ยนจาก itemId
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

    // ✅ ดึงรายการสินค้าของผู้ใช้จาก wallet ที่ login อยู่
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

    // ✅ ฟังก์ชันสำหรับส่งคำขอแลกเปลี่ยนไปยัง Smart Contract บน Blockchain
    const handleExchangeRequest = async () => {
        if (!selectedItem || !item) return;
        setLoading(true);

        try {
            if (!window.ethereum) {
                alert("❌ MetaMask not found!");
                return;
            }

            // ✅ เชื่อมต่อ Ethereum ผ่าน MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // ✅ ตรวจสอบว่ามีการตั้งค่า Smart Contract หรือไม่
            if (!contractConfig.abi || !process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS) {
                throw new Error("Smart contract config is missing!");
            }

            // ✅ สร้างอินสแตนซ์ contract ที่เชื่อมต่อ signer
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS,
                contractConfig.abi,
                signer
            );

            // ✅ เรียกใช้ฟังก์ชัน requestExchange บน Smart Contract
            const tx = await contract.requestExchange(
                item.owner_wallet,
                selectedItem._id,
                item._id
            );

            await tx.wait();
            console.log("🔗 Transaction Hash:", tx.hash);
            alert("✅ Exchange request sent to blockchain!");
        } catch (error) {
            console.error(error);
            alert("❌ Exchange request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-row items-start justify-center min-l-screen p-8 gap-10 bg-gradient-to-br from-gray-90 to-white">
            {/* ✅ ฝั่งซ้าย: แสดงข้อมูลสินค้าที่ต้องการแลก */}
            <div className="bg-white shadow-2xl rounded-3xl p-6 max-w-md w-full transition hover:scale-[1.02]">
                {item ? (
                    <>
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-60 object-cover rounded-xl shadow-sm"
                        />
                        <div className="mt-5">
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.name}</h3>
                            <p className="text-gray-500 mb-2">{item.description}</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text">
                                ${item.price}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                                Owner: {item.owner_wallet}
                            </p>
                        </div>
                    </>
                ) : (
                    <p>Loading item...</p>
                )}
            </div>

            {/* ✅ ฝั่งขวา: เลือกรายการสินค้าของผู้ใช้สำหรับใช้แลก */}
            <div className="bg-white shadow-2xl rounded-3xl p-6 max-w-md w-full">
                <h4 className="text-xl font-bold mb-4 text-gray-700">Select Item to Exchange:</h4>
                <div className="grid grid-cols-2 gap-4">
                    {userItems.map((userItem) => (
                        <button
                            key={userItem._id}
                            className={`p-3 border rounded-2xl w-full flex flex-col items-center gap-2 transition hover:scale-105 ${
                                selectedItem?._id === userItem._id
                                    ? "bg-indigo-500 text-white"
                                    : "bg-gray-100"
                            }`}
                            onClick={() => setSelectedItem(userItem)}
                        >
                            <img
                                src={userItem.image_url}
                                alt={userItem.name}
                                className="w-20 h-20 object-cover rounded-xl shadow"
                            />
                            <p className="text-sm font-semibold">{userItem.name}</p>
                        </button>
                    ))}
                </div>

                {/* ✅ แสดงสินค้าที่เลือกอยู่ */}
                {selectedItem && (
                    <div className="mt-6 p-4 border rounded-2xl bg-gray-100 shadow-inner">
                        <h4 className="text-lg font-semibold mb-2 text-gray-700">Selected Item:</h4>
                        <img
                            src={selectedItem.image_url}
                            alt={selectedItem.name}
                            className="w-full h-40 object-cover rounded-xl"
                        />
                        <p className="text-center mt-2 font-bold text-gray-800">{selectedItem.name}</p>
                    </div>
                )}

                <button
                    className={`mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 rounded-2xl text-lg shadow hover:scale-105 transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
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
