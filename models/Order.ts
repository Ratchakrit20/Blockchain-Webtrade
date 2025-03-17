import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    owner_wallet: string;
    name: string;
    description: string;
    price: number;
    image_url: string; // ✅ ใช้ URL แทน base64
    created_at: Date;
    updated_at: Date;
}

const OrderSchema: Schema = new Schema(
  {
    owner_wallet: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image_url: { type: String, required: true }, // ✅ เปลี่ยนจาก image_base64 เป็น image_url
  },
  { timestamps: true } // ✅ เพิ่ม created_at & updated_at อัตโนมัติ
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
