import { NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// กำหนดตำแหน่งที่จะเก็บไฟล์
const uploadDir = path.join(process.cwd(), "public/uploads");

// ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่ ถ้าไม่มีให้สร้าง
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

// ตั้งค่าการอัปโหลดไฟล์โดยใช้ `multer`
const upload = multer({ dest: uploadDir });

export async function POST(req: Request) {
  try {
    await ensureUploadDir(); // ตรวจสอบโฟลเดอร์
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // สร้างชื่อไฟล์ใหม่
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // อ่านไฟล์และบันทึก
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    const imageUrl = `/uploads/${fileName}`;

    return NextResponse.json({ message: "File uploaded successfully", image_url: imageUrl }, { status: 201 });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
