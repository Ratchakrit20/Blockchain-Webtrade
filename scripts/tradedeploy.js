const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const TradeRecord = await hre.ethers.deployContract("TradeRecord");
  await TradeRecord.waitForDeployment();

  console.log("✅ TradeRecord deployed to:", TradeRecord.target);

  let envContent = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
  const newEnvContent = envContent
    .split("\n")
    .filter((line) => !line.startsWith("NEXT_PUBLIC_TRADE_CONTRACT_ADDRESS"))
    .join("\n") + `\nNEXT_PUBLIC_TRADE_CONTRACT_ADDRESS=${TradeRecord.target}\n`;

  fs.writeFileSync(".env.local", newEnvContent);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
