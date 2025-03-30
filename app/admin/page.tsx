"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import DashUser from "./Dash-User";
import DashItems from "./Dash-Item";
import DashExchange from "./Dash-Exchange";
import DashTrade from "./Dash-Trade";
import DashDonate from "./Dash-Donate";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  wallet_address: string;
  coin: number;
}

interface ItemInfo {
  _id: string;
  name: string;
  description: string;
  price: number;
  owner_wallet: string;
  image_url: string;
}
const tabs = ["User", "Items", "Exchange", "Trade"];


export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [items, setItems] = useState<ItemInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("User");
  const renderTabContent = () => {
    switch (activeTab) {
      case "User":
        return <DashUser users={users} onDelete={handleDeleteUser} />;
      case "Items":
        return <DashItems items={items} onDeleteItem={handleDeleteItem} />;
      case "Exchange History":
        return <DashExchange />;
      case "Trade History":
        return <DashTrade />;
      case "Donation History":
        return <DashDonate />;
      default:
        return <p className="text-gray-500">Select a tab to view content.</p>;
    }
  };
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user.role !== "admin") {
      router.push("/login");
    } else {
      fetchData();
    }
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchItems()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user/allUsers");
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };
  const handleDeleteUser = async (wallet_address: string) => {
    if (window.confirm(`ยืนยันลบผู้ใช้ที่มี wallet: ${wallet_address}?`)) {
      try {
        const res = await fetch(`/api/user/${wallet_address}`, {
          method: "DELETE",
        });
  
        if (res.ok) {
          toast.success("ลบผู้ใช้สำเร็จ");
          // remove user จาก state ทันที
          setUsers((prev) =>
            prev.filter((user) => user.wallet_address !== wallet_address)
          );
          setItems((prev) => prev.filter((item) => item.owner_wallet !== wallet_address));
        } else {
          const errorData = await res.json();
          toast.error(`เกิดข้อผิดพลาด: ${errorData.message}`);
        }
      } catch (error) {
        console.error(error);
        toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/order");
      const data = await res.json();
      setItems(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteItem = async (id: string) => {
    if (confirm("ต้องการลบไอเทมนี้หรือไม่?")) {
      try {
        const res = await fetch(`/api/order/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("ลบ Item สำเร็จ");
          setItems((prev) => prev.filter((item) => item._id !== id));
        } else {
          const error = await res.json();
          toast.error(error.error || "ลบไม่สำเร็จ");
        }
      } catch (err) {
        console.error(err);
        toast.error("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex space-x-4 border-b pb-2 mb-4">
          {["User", "Items", "Exchange History", "Trade History", "Donation History"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-t-md ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-gray-50 p-6 rounded-md shadow-inner min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>









    
  );
}
