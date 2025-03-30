// contracts/donateConfig.ts
import abi from "../artifacts/contracts/DonateContract.sol/DonateContract.json";

const donatecontractConfig = {
    address: process.env.NEXT_PUBLIC_DONATE_CONTRACT_ADDRESS,
    abi: abi.abi,
};

export default donatecontractConfig;
