import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request, props: { params: Promise<{ wallet_address: string }> }) {
  try {
    await connectToDatabase();
    const params = await props.params;
    const wallet_address = params.wallet_address; // ✅ ดึงค่า `wallet_address` ออกจาก `params`

    // ค้นหาผู้ใช้จาก MongoDB ตาม wallet_address
    const user = await User.findOne({ wallet_address });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ ส่งข้อมูลผู้ใช้กลับไป
    return NextResponse.json(
      {
        message: "User found",
        name: user.name,
        email: user.email,
        wallet_address: user.wallet_address,
        coin: user.coin,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
