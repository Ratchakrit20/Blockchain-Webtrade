import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

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

export async function DELETE(req: Request, props: { params: Promise<{ wallet_address: string }> }) {
  try {
    await connectToDatabase();
    const params = await props.params;
    const wallet_address = params.wallet_address;

    // ตรวจสอบว่ามี user นี้จริงไหม
    const user = await User.findOne({ wallet_address });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ ลบผู้ใช้
    await User.deleteOne({ wallet_address });

    // ✅ (ถ้าต้องการ) ลบ items ที่ผูกกับ wallet_address นี้ด้วย
    await Order.deleteMany({ owner_wallet: wallet_address });

    return NextResponse.json(
      { message: `User with wallet_address ${wallet_address} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
