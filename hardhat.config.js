/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // 🔹 ใช้ RPC URL ของ Ganache
      accounts: [`${process.env.NEXT_PUBLIC_PRIVATE_KEY}`], // 🔹 ใช้ Private Key จากบัญชี Ganache
    },
  },
};
