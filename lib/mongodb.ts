import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define MONGODB_URI in .env.local");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "blockchainapp",
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // ✅ ลดเวลา Timeout เป็น 5 วินาที
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected Successfully!");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
