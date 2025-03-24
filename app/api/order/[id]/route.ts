import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> } // ✅ ใช้ `context.params`
) {
  try {
    await connectToDatabase(); // ✅ เชื่อมต่อฐานข้อมูล

    const params = await props.params;
    const id = params.id; // ✅ ดึงค่า `id` ออกจาก `context`
    if (!id) {
      return NextResponse.json({ message: "Missing order ID" }, { status: 400 });
    }

    console.log("🔍 Fetching order ID:", id); // ✅ ตรวจสอบค่าที่ดึงมาได้

    const order = await Order.findById(id); // ✅ ค้นหา Order ตาม ID

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ message: "Server error", error: error }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  const data = await req.json();

  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;

  try {
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}


