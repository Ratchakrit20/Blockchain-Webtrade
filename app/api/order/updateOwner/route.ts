import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { item_1_id, item_2_id, new_owner_1, new_owner_2 } = await req.json();

    if (!item_1_id || !item_2_id || !new_owner_1 || !new_owner_2) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // ✅ Validate if the item IDs are valid ObjectIds
    if (!Types.ObjectId.isValid(item_1_id) || !Types.ObjectId.isValid(item_2_id)) {
      return NextResponse.json({ message: "Invalid ObjectId format" }, { status: 400 });
    }

    

    // ✅ Check if items exist in the database
    const order1 = await Order.findById(item_1_id);
    const order2 = await Order.findById(item_2_id);

    if (!order1 || !order2) {
      return NextResponse.json({ message: "Item not found in database" }, { status: 404 });
    }

    // ✅ Update the owner of the exchanged items
    const update1 = await Order.findByIdAndUpdate(order1, { owner_wallet: new_owner_1 }, { new: true });
    const update2 = await Order.findByIdAndUpdate(order2, { owner_wallet: new_owner_2 }, { new: true });

    if (!update1 || !update2) {
      return NextResponse.json({ message: "Failed to update owner. Check IDs" }, { status: 400 });
    }

    return NextResponse.json({ message: "Owner updated successfully", updatedItems: { update1, update2 } }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating order owner:", error);
    return NextResponse.json({ message: "Server error", error: error }, { status: 500 });
  }
}
