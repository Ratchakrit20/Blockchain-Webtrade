import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    console.log("✅ Database connected");

    // รับข้อมูลจาก Body ของ Request
    const { name, email, password, wallet_address, coin } = await req.json();
    console.log("Received data:", { name, email, wallet_address, coin });

    // ตรวจสอบว่าข้อมูลครบหรือไม่
    if (!name || !email || !password || !wallet_address) {
      console.error("⚠️ Missing fields");
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking if user exists...");
    const existingUser = await User.findOne({
      $or: [{ email }, { wallet_address }], // ตรวจสอบอีเมลและกระเป๋าเงิน
    }).lean();

    if (existingUser) {
      console.error("⚠️ Email or Wallet already exists");
      return NextResponse.json(
        { message: "Email or Wallet already registered" },
        { status: 400 }
      );
    }

    console.log("🔑 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    console.log("📝 Creating new user...");
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      wallet_address,
      coin: coin , // ✅ ถ้ามีค่า coin จาก MetaMask ให้ใช้ ถ้าไม่มีให้ 100
    });

    console.log("✅ User created:", newUser);

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
