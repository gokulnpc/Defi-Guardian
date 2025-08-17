const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing PremiumVault Configuration...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");

  try {
    console.log("📋 Configuration:");
    console.log("==================");
    console.log(`PremiumVault: ${PREMIUM_VAULT}`);
    console.log(`PolicyManager: ${POLICY_MANAGER}`);
    console.log(`Hedera Chain Selector: ${HEDERA_CHAIN_SELECTOR}`);

    // Get PremiumVault contract
    const PremiumVault = await ethers.getContractFactory("PremiumVault");
    const premiumVault = PremiumVault.attach(PREMIUM_VAULT);

    // Check current owner
    const owner = await premiumVault.owner();
    console.log(`\n👑 Current owner: ${owner}`);
    
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.error("❌ You are not the owner of the PremiumVault contract");
      return;
    }

    // Encode the PolicyManager address as receiver
    const policyManagerReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [POLICY_MANAGER]
    );
    
    console.log(`\n🎯 PolicyManager receiver (encoded): ${policyManagerReceiver}`);

    // Check if receiver is already allowlisted
    const isAllowlisted = await premiumVault.allowlistedReceivers(policyManagerReceiver);
    console.log(`\n📋 Current allowlist status: ${isAllowlisted}`);

    if (!isAllowlisted) {
      console.log("\n✅ Allowlisting PolicyManager as receiver...");
      const tx = await premiumVault.allowlistReceiver(policyManagerReceiver, true);
      await tx.wait();
      console.log(`✅ Receiver allowlisted! Transaction: ${tx.hash}`);
    } else {
      console.log("✅ PolicyManager receiver is already allowlisted");
    }

    // Check if Hedera chain is allowlisted
    const isChainAllowlisted = await premiumVault.allowlistedDestChains(HEDERA_CHAIN_SELECTOR);
    console.log(`\n📋 Hedera chain allowlist status: ${isChainAllowlisted}`);

    if (!isChainAllowlisted) {
      console.log("\n✅ Allowlisting Hedera as destination chain...");
      const tx = await premiumVault.allowlistDestChain(HEDERA_CHAIN_SELECTOR, true);
      await tx.wait();
      console.log(`✅ Chain allowlisted! Transaction: ${tx.hash}`);
    } else {
      console.log("✅ Hedera chain is already allowlisted");
    }

    // Check gas limit
    const gasLimit = await premiumVault.gasLimitByChain(HEDERA_CHAIN_SELECTOR);
    console.log(`\n⛽ Current gas limit: ${gasLimit}`);

    if (gasLimit === 0n) {
      console.log("\n✅ Setting gas limit for Hedera...");
      const tx = await premiumVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 200000);
      await tx.wait();
      console.log(`✅ Gas limit set! Transaction: ${tx.hash}`);
    } else {
      console.log("✅ Gas limit is already set");
    }

    console.log("\n🎉 PremiumVault configuration fixed successfully!");
    console.log("===============================================");
    console.log("✅ PolicyManager receiver allowlisted");
    console.log("✅ Hedera chain allowlisted");
    console.log("✅ Gas limit configured");

  } catch (error) {
    console.error("❌ Configuration fix failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
