require("dotenv").config({ path: ".env.local" });
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);
  console.log("📦 Wallet from ENV:", process.env.NEXT_PUBLIC_RECIPIENT_WALLET);

  const DonateContract = await ethers.getContractFactory("DonateContract");
  const donateContract = await DonateContract.deploy(process.env.NEXT_PUBLIC_RECIPIENT_WALLET);

  await donateContract.waitForDeployment();

  const deployedAddress = await donateContract.getAddress(); // ✅ ใช้อันนี้แทน .target
  console.log(`✅ Contract deployed at: ${deployedAddress}`);

  let envContent = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
  const newEnvContent = envContent
    .split("\n")
    .filter(line => !line.startsWith("NEXT_PUBLIC_DONATE_CONTRACT_ADDRESS"))
    .join("\n") + `\nNEXT_PUBLIC_DONATE_CONTRACT_ADDRESS=${deployedAddress}\n`;

  fs.writeFileSync(".env.local", newEnvContent);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
