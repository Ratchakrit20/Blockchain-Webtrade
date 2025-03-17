import { NextResponse } from "next/server";
import { ethers } from "ethers";
import contractConfig from "@/utils/exchangeContract";

export async function POST(req: Request) {
    try {
        const { exchange_id } = await req.json();
        if (!exchange_id) return NextResponse.json({ message: "Missing exchange ID" }, { status: 400 });

        // ✅ ตรวจสอบว่า `window.ethereum` พร้อมใช้งาน
        if (typeof window === "undefined" || !window.ethereum) {
            return NextResponse.json({ message: "Metamask not detected" }, { status: 400 });
        }

        // ✅ เชื่อมต่อ Wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(); // ✅ ต้อง `await` เพราะ `getSigner()` เป็น async
        const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS!,
            contractConfig.abi,
            signer
        );

        // ❌ ปฏิเสธการแลกเปลี่ยน
        const tx = await contract.rejectExchange(exchange_id);
        await tx.wait();

        return NextResponse.json({ message: "Exchange rejected successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error rejecting exchange:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
