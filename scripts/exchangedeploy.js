require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(`Deploying contract with account: ${deployer.address}`);

    // ✅ เรียกใช้ Contract
    const ExchangeContract = await ethers.getContractFactory("ExchangeContract");
    const exchangeContract = await ExchangeContract.deploy(); // ✅ Deploy Smart Contract

    await exchangeContract.waitForDeployment(); // ✅ แก้ไขตรงนี้จาก `deployed()` เป็น `waitForDeployment()`

    console.log(`✅ Contract deployed at address: ${exchangeContract.target}`);

    // ✅ บันทึก Address ลงไฟล์ .env
    const fs = require("fs");

    // อ่านค่าเดิมจากไฟล์ `.env.local`
    let envContent = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";

    // อัปเดตค่าหรือเพิ่มใหม่
    const newEnvContent = envContent
        .split("\n")
        .filter(line => !line.startsWith("NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS")) // ลบค่าที่มีอยู่
        .join("\n") + `\nNEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS=${exchangeContract.target}\n`;

    // เขียนทับไฟล์ `.env.local`
    fs.writeFileSync(".env.local", newEnvContent);
}

// ✅ Handle Errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
