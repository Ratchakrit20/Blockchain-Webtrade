"use client";
import React from "react";
import OrderList from "./OrderList";


export default function Page() {
    
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      <OrderList />
    </main>
  );
}
