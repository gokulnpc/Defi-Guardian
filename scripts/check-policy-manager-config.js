const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking PolicyManager Configuration...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499"; // Sepolia address
  const SEPOLIA_CHAIN_SELECTOR = BigInt("16015286601757825753");

  try {
    console.log("📋 Configuration Check:");
    console.log("=======================");
    console.log(`PolicyManager (Hedera): ${POLICY_MANAGER}`);
    console.log(`PremiumVault (Sepolia): ${PREMIUM_VAULT}`);
    console.log(`Sepolia Chain Selector: ${SEPOLIA_CHAIN_SELECTOR}`);

    // Note: We can't directly check Hedera contracts from Sepolia
    // This is a manual verification guide
    console.log("\n⚠️  Manual Verification Required:");
    console.log("================================");
    console.log("Since PolicyManager is on Hedera testnet, you need to verify:");
    console.log("");
    console.log("1. Source Chain Allowlist:");
    console.log(`   - Chain Selector: ${SEPOLIA_CHAIN_SELECTOR}`);
    console.log(`   - Should be allowlisted: true`);
    console.log("");
    console.log("2. Sender Allowlist:");
    console.log(`   - Sender: ${PREMIUM_VAULT}`);
    console.log(`   - Should be allowlisted: true`);
    console.log("");
    console.log("3. Verification Commands (run on Hedera network):");
    console.log("   ```javascript");
    console.log("   // Check source chain allowlist");
    console.log(`   const sourceAllowed = await policyManager.allowlistedSourceChains(${SEPOLIA_CHAIN_SELECTOR});`);
    console.log("   console.log('Source chain allowed:', sourceAllowed);");
    console.log("");
    console.log("   // Check sender allowlist");
    console.log(`   const senderEncoded = ethers.AbiCoder.defaultAbiCoder().encode(['address'], ['${PREMIUM_VAULT}']);`);
    console.log("   const senderAllowed = await policyManager.allowlistedSenders(senderEncoded);");
    console.log("   console.log('Sender allowed:', senderAllowed);");
    console.log("   ```");

    console.log("\n🔧 Configuration Script:");
    console.log("=======================");
    console.log("If the checks fail, run this configuration script on Hedera:");
    console.log("");
    console.log("```javascript");
    console.log("// Allowlist Sepolia as source chain");
    console.log(`await policyManager.allowlistSourceChain(${SEPOLIA_CHAIN_SELECTOR}, true);`);
    console.log("");
    console.log("// Allowlist PremiumVault as sender");
    console.log(`const senderEncoded = ethers.AbiCoder.defaultAbiCoder().encode(['address'], ['${PREMIUM_VAULT}']);`);
    console.log("await policyManager.allowlistSender(senderEncoded, true);");
    console.log("```");

    console.log("\n📋 Expected Data Flow:");
    console.log("=====================");
    console.log("1. User calls PremiumVault.buyCoverage() on Sepolia");
    console.log("2. PremiumVault sends CCIP message to PolicyManager on Hedera");
    console.log("3. PolicyManager receives message and checks:");
    console.log("   - Source chain (Sepolia) is allowlisted ✅");
    console.log("   - Sender (PremiumVault) is allowlisted ✅");
    console.log("4. PolicyManager processes the policy and mints NFT");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
