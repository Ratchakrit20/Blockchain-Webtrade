"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Exchange from "./Exchange";
import Buy from "./Buy";
import styles from "./styles/switch.module.css";

export default function Page() {
    const [switchs, setSwitch] = useState(true);
    const searchParams = useSearchParams();
    
    // ✅ รับค่า `id` จาก Query Parameters
    const item_id = searchParams.get("id");

    return (
        <div className="mt-5">
            <label className={styles.switch}>
                <input 
                    type="checkbox" 
                    checked={!switchs} 
                    onChange={() => setSwitch(!switchs)}
                />
                <span className={styles.slider}></span>
            </label>
            {switchs ? <h1>Exchange Page</h1> : <h1>Buy Page</h1>}
            {/* ✅ ส่งค่า `id` ไปที่ Exchange และ Buy */}
            {switchs ? <Exchange itemId={item_id} /> : <Buy itemId={item_id} />}
        </div>
    );
}
