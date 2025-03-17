"use client";
import React, { useEffect, useState } from "react";

interface BuyProps {
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

const Buy: React.FC<BuyProps> = ({ itemId }) => {
    const [item, setItem] = useState<Item|null>(null);

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
                        <p className="text-blue-500 font-bold text-lg">${item.price}</p>
                        <p className="text-sm text-gray-400">
                        Owner: <span className="font-mono">{item.owner_wallet}</span>
                        </p>
                        <button
                        className="mt-4 w-full bg-yellow-400 text-black font-bold py-2 rounded-md hover:bg-yellow-500 transition"
                        >
                        CLICK
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
