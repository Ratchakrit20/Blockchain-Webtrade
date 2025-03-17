import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";


// ✅ ดึงรายการออเดอร์ทั้งหมด หรือกรองด้วย owner_wallet
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // ✅ อ่าน Query Parameters
    const { searchParams } = new URL(req.url);
    const owner_wallet = searchParams.get("owner");

    const query = owner_wallet ? { owner_wallet } : {}; // ถ้ามี owner_wallet กรองเฉพาะของผู้ใช้

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    console.log("📥 Receiving Request...");
    await connectToDatabase();
    console.log("✅ Database connected");

    // ✅ รับค่าจาก Body
    const { owner_wallet, name, description, price, image_url } = await req.json();
    console.log("📦 Received Data:", { owner_wallet, name, description, price, image_url });

    // ✅ ตรวจสอบค่าว่าง
    if (!owner_wallet || !name || !description || !price || !image_url) {
      console.error("⚠️ Missing fields:", { owner_wallet, name, description, price, image_url });
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // ✅ บันทึกลงฐานข้อมูล
    const newOrder = await Order.create({
      owner_wallet,
      name,
      description,
      price: Number(price),
      image_url, // ✅ ใช้ image_url แทน base64
    });

    console.log("✅ Order Created:", newOrder);
    return NextResponse.json({ message: "Item added successfully", order: newOrder }, { status: 201 });

  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ message: "Server error", error: error }, { status: 500 });
  }
}
