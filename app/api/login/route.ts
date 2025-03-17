import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    // ค้นหาผู้ใช้จาก MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // ✅ ส่งข้อมูล `wallet_address` และ `coin` กลับไป
    return NextResponse.json(
      {
        message: "Login successful",
        wallet_address: user.wallet_address, // ✅ กระเป๋าเงินของผู้ใช้
        coin: user.coin, // ✅ จำนวนโทเค็นที่มีในระบบ
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
