import mongoose, { Schema, Document } from "mongoose";

// Interface สำหรับ User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  wallet_address: string;
  coin: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallet_address: { type: String, required: true, unique: true },
    coin: { type: Number, required: true, default: 100 }, // ✅ ให้เริ่มต้นที่ 100 แต้ม
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true } // เพิ่ม createdAt & updatedAt อัตโนมัติ
);

// ป้องกันการสร้าง Model ซ้ำ
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
