import { NextResponse } from "next/server";

let cachedPrice: any = null;
let lastFetchedTime = 0;

export async function GET() {
  const now = Date.now();
  if (cachedPrice && now - lastFetchedTime < 60000) { // 60 วินาที
    return NextResponse.json(cachedPrice);
  }

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const data = await res.json();

    if (!data.ethereum || !data.ethereum.usd) {
      return NextResponse.json({ error: "Invalid price data" }, { status: 500 });
    }

    cachedPrice = data;
    lastFetchedTime = now;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ETH price" }, { status: 500 });
  }
}
