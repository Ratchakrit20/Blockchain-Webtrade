import abi from "../artifacts/contracts/TradeContract.sol/TradeRecord.json"; // ✅ Import ABI

const tradecontractConfig = {
    address: process.env.NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS, // ✅ อ่าน Address จาก .env.local
    abi: abi.abi, // ✅ Smart Contract ABI
};

export default tradecontractConfig;
