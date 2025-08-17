require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : ["70da3ff3da418eee005a376ea30fe469fb5e78b7c36b35a24f369b3adbfdc61c"],
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
    },
    hedera: {
      url: process.env.HEDERA_RPC_URL || "https://testnet.hashio.io",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : ["70da3ff3da418eee005a376ea30fe469fb5e78b7c36b35a24f369b3adbfdc61c"],
      chainId: 296,
      timeout: 60000, // 60 seconds timeout
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
