import abi from "../artifacts/contracts/ExchangeContract.sol/ExchangeContract.json"; // ✅ Import ABI

const contractConfig = {
    address: process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS, // ✅ อ่าน Address จาก .env.local
    abi: abi.abi, // ✅ Smart Contract ABI
};

export default contractConfig;
