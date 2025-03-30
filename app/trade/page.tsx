"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Exchange from "./Exchange";
import Buy from "./Buy";
import { Repeat, ShoppingCart } from "lucide-react";

export default function Page() {
    const [switchs, setSwitch] = useState(true);
    const searchParams = useSearchParams();
    const item_id = searchParams.get("id");

    return (
        <div className="flex flex-col items-center  p-4">
            {/* ✅ Toggle Switch แบบหรูหราพร้อมแถบ card */}
            <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-4 bg-white shadow-md p-3 rounded-2xl">
                    <span className={`text-gray-500 font-medium ${switchs ? "text-indigo-500 font-bold" : ""}`}>
                        Exchange
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!switchs}
                            onChange={() => setSwitch(!switchs)}
                        />
                        <div className="w-16 h-9 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gradient-to-r after:from-orange-400 after:to-pink-500 after:rounded-full after:h-8 after:w-8 after:transition-all"></div>
                    </label>
                    <span className={`text-gray-500 font-medium ${!switchs ? "text-green-500 font-bold" : ""}`}>
                        Buy
                    </span>
                </div>

                {/* ✅ ข้อความหัวหน้าพร้อมไอคอน */}
                <div className="mt-6 flex items-center gap-2 text-3xl font-bold text-gray-700">
                    {switchs ? <Repeat size={32} className="text-orange-500" /> : <ShoppingCart size={32} className="text-green-500" />}
                    {switchs ? "Exchange Page" : "Buy Page"}
                </div>
            </div>

            {/* ✅ Render ส่วน Exchange / Buy ตาม toggle */}
            <div className="w-full">
                {switchs ? <Exchange itemId={item_id} /> : <Buy itemId={item_id} />}
            </div>
        </div>
    );
}
