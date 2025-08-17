const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Configuring PremiumVault → PolicyManager Allowlist...\n");

  // Your deployed contract addresses
  const PREMIUM_VAULT = "0xc2fE392C66eD17BA2C388A41fee23Ff4Fd4ba037"; // Arbitrum
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569"; // Hedera

  // ⚠️ IMPORTANT: You need to get the correct chain selectors for your networks
  // These are placeholder values - you need to replace them with actual values
  const HEDERA_CHAIN_SELECTOR = 0x0000000000000000000000000000000000000000000000000000000000000001; // Replace with actual Hedera selector
  const ARBITRUM_CHAIN_SELECTOR = 0x0000000000000000000000000000000000000000000000000000000000000002; // Replace with actual Arbitrum selector

  // Get signer (make sure this is the contract owner)
  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  try {
    // 1. Configure PremiumVault to send to PolicyManager
    console.log("\n📤 Step 1: Configuring PremiumVault (Arbitrum) → PolicyManager (Hedera)");
    
    const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
    
    // Allow Hedera destination chain
    console.log("   🔗 Allowing Hedera destination chain...");
    const tx1 = await premiumVault.allowlistDestChain(HEDERA_CHAIN_SELECTOR, true);
    await tx1.wait();
    console.log("   ✅ Transaction:", tx1.hash);

    // Allow PolicyManager receiver
    console.log("   🎯 Allowing PolicyManager receiver...");
    const policyManagerEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [POLICY_MANAGER]);
    const tx2 = await premiumVault.allowlistReceiver(policyManagerEncoded, true);
    await tx2.wait();
    console.log("   ✅ Transaction:", tx2.hash);

    // Set gas limit for Hedera
    console.log("   ⛽ Setting gas limit for Hedera...");
    const tx3 = await premiumVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 200000);
    await tx3.wait();
    console.log("   ✅ Transaction:", tx3.hash);

    // 2. Configure PolicyManager to receive from PremiumVault
    console.log("\n📥 Step 2: Configuring PolicyManager (Hedera) ← PremiumVault (Arbitrum)");
    
    const policyManager = await ethers.getContractAt("PolicyManager", POLICY_MANAGER);
    
    // Allow Arbitrum source chain
    console.log("   🔗 Allowing Arbitrum source chain...");
    const tx4 = await policyManager.allowlistSourceChain(ARBITRUM_CHAIN_SELECTOR, true);
    await tx4.wait();
    console.log("   ✅ Transaction:", tx4.hash);

    // Allow PremiumVault sender
    console.log("   🎯 Allowing PremiumVault sender...");
    const premiumVaultEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [PREMIUM_VAULT]);
    const tx5 = await policyManager.allowlistSender(premiumVaultEncoded, true);
    await tx5.wait();
    console.log("   ✅ Transaction:", tx5.hash);

    console.log("\n🎉 Allowlist configuration complete!");
    console.log("\n📋 Configuration Summary:");
    console.log("   • PremiumVault can now send to PolicyManager ✅");
    console.log("   • PolicyManager can now receive from PremiumVault ✅");
    console.log("   • Gas limit set to 200,000 for Hedera ✅");
    
    console.log("\n⚠️  IMPORTANT: Verify your chain selectors!");
    console.log("   • Hedera Chain Selector:", HEDERA_CHAIN_SELECTOR.toString());
    console.log("   • Arbitrum Chain Selector:", ARBITRUM_CHAIN_SELECTOR.toString());
    console.log("   • Replace these with actual values for your networks");

  } catch (error) {
    console.error("❌ Error during configuration:", error.message);
    
    if (error.message.includes("chain selector")) {
      console.log("\n💡 Tip: You need to update the chain selectors in this script");
      console.log("   • Check Chainlink CCIP documentation for your network selectors");
      console.log("   • Or use the CCIP router's getSupportedTokens() function");
    }
    
    if (error.message.includes("owner")) {
      console.log("\n💡 Tip: Make sure you're using the contract owner account");
      console.log("   • Only the contract owner can configure allowlists");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
