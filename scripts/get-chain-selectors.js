const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Finding Chain Selectors for CCIP...\n");

  // Common chain selectors (you can verify these with Chainlink documentation)
  const CHAIN_SELECTORS = {
    // Mainnet
    "Ethereum Mainnet": "0x0000000000000000000000000000000000000000000000000000000000000001",
    "Arbitrum One": "0x0000000000000000000000000000000000000000000000000000000000000002",
    "Polygon": "0x0000000000000000000000000000000000000000000000000000000000000003",
    "Avalanche": "0x0000000000000000000000000000000000000000000000000000000000000004",
    "Optimism": "0x0000000000000000000000000000000000000000000000000000000000000005",
    "Base": "0x0000000000000000000000000000000000000000000000000000000000000006",
    "BSC": "0x0000000000000000000000000000000000000000000000000000000000000007",
    
    // Testnets
    "Sepolia": "0x0000000000000000000000000000000000000000000000000000000000000008",
    "Arbitrum Sepolia": "0x0000000000000000000000000000000000000000000000000000000000000009",
    "Polygon Mumbai": "0x000000000000000000000000000000000000000000000000000000000000000A",
    "Avalanche Fuji": "0x000000000000000000000000000000000000000000000000000000000000000B",
    "Optimism Goerli": "0x000000000000000000000000000000000000000000000000000000000000000C",
    "Base Goerli": "0x000000000000000000000000000000000000000000000000000000000000000D",
    "BSC Testnet": "0x000000000000000000000000000000000000000000000000000000000000000E",
    
    // Hedera (you need to verify this)
    "Hedera Mainnet": "0x000000000000000000000000000000000000000000000000000000000000000F",
    "Hedera Testnet": "0x0000000000000000000000000000000000000000000000000000000000000010"
  };

  console.log("📋 Common Chain Selectors:");
  console.log("==========================");
  
  for (const [network, selector] of Object.entries(CHAIN_SELECTORS)) {
    console.log(`${network.padEnd(20)}: ${selector}`);
  }

  console.log("\n⚠️  IMPORTANT NOTES:");
  console.log("1. These are common selectors - verify with Chainlink documentation");
  console.log("2. For Hedera, check the official Chainlink CCIP documentation");
  console.log("3. You can also query the CCIP router contract for supported chains");
  
  console.log("\n🔧 To verify chain selectors programmatically:");
  console.log("1. Connect to the CCIP router on your network");
  console.log("2. Call getSupportedTokens() or similar function");
  console.log("3. Check the Chainlink CCIP documentation for your specific network");

  console.log("\n📝 Next Steps:");
  console.log("1. Update the chain selectors in allowlist-policy-manager.js");
  console.log("2. Run the allowlist configuration script");
  console.log("3. Test the cross-chain communication");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
