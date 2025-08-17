const { ethers } = require("hardhat");

async function main() {
  console.log("🔗 Allowlisting PremiumVault on PolicyManager (Hedera)...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499"; // Sepolia address
  const SEPOLIA_CHAIN_SELECTOR = BigInt("16015286601757825753");

  try {
    console.log("📋 Configuration:");
    console.log("=================");
    console.log(`PolicyManager (Hedera): ${POLICY_MANAGER}`);
    console.log(`PremiumVault (Sepolia): ${PREMIUM_VAULT}`);
    console.log(`Sepolia Chain Selector: ${SEPOLIA_CHAIN_SELECTOR}`);

    // Get PolicyManager contract
    const policyManager = await ethers.getContractAt("PolicyManager", POLICY_MANAGER);
    console.log(`✅ Connected to PolicyManager`);

    // Check current owner
    try {
      const owner = await policyManager.owner();
      console.log(`📋 Contract owner: ${owner}`);
      console.log(`👤 Signer address: ${signer.address}`);
      console.log(`🔐 Is owner: ${owner.toLowerCase() === signer.address.toLowerCase()}`);
    } catch (error) {
      console.log(`❌ Owner check failed: ${error.message}`);
    }

    // Check current allowlist status
    console.log("\n🔍 Current Allowlist Status:");
    console.log("============================");
    
    try {
      const sourceChainAllowed = await policyManager.allowlistedSourceChains(SEPOLIA_CHAIN_SELECTOR);
      console.log(`Source chain (Sepolia) allowed: ${sourceChainAllowed}`);
    } catch (error) {
      console.log(`❌ Source chain check failed: ${error.message}`);
    }

    // Encode the PremiumVault address for the sender allowlist
    const senderEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [PREMIUM_VAULT]
    );
    console.log(`\n📝 Encoded sender: ${senderEncoded}`);

    try {
      const senderAllowed = await policyManager.allowlistedSenders(senderEncoded);
      console.log(`Sender (PremiumVault) allowed: ${senderAllowed}`);
    } catch (error) {
      console.log(`❌ Sender check failed: ${error.message}`);
    }

    // Configure allowlists
    console.log("\n⚙️ Configuring Allowlists:");
    console.log("==========================");

    // Allowlist Sepolia as source chain
    console.log("🔗 Allowlisting Sepolia as source chain...");
    try {
      const tx1 = await policyManager.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
      console.log(`Transaction hash: ${tx1.hash}`);
      
      const receipt1 = await tx1.wait();
      console.log(`✅ Source chain allowlisted in block: ${receipt1.blockNumber}`);
    } catch (error) {
      console.log(`❌ Source chain allowlist failed: ${error.message}`);
    }

    // Allowlist PremiumVault as sender
    console.log("\n🎯 Allowlisting PremiumVault as sender...");
    try {
      const tx2 = await policyManager.allowlistSender(senderEncoded, true);
      console.log(`Transaction hash: ${tx2.hash}`);
      
      const receipt2 = await tx2.wait();
      console.log(`✅ Sender allowlisted in block: ${receipt2.blockNumber}`);
    } catch (error) {
      console.log(`❌ Sender allowlist failed: ${error.message}`);
    }

    // Verify configuration
    console.log("\n✅ Verification:");
    console.log("================");
    
    try {
      const finalSourceChainAllowed = await policyManager.allowlistedSourceChains(SEPOLIA_CHAIN_SELECTOR);
      console.log(`Source chain (Sepolia) allowed: ${finalSourceChainAllowed}`);
    } catch (error) {
      console.log(`❌ Final source chain check failed: ${error.message}`);
    }

    try {
      const finalSenderAllowed = await policyManager.allowlistedSenders(senderEncoded);
      console.log(`Sender (PremiumVault) allowed: ${finalSenderAllowed}`);
    } catch (error) {
      console.log(`❌ Final sender check failed: ${error.message}`);
    }

    console.log("\n🎉 Configuration Complete!");
    console.log("==========================");
    console.log("✅ PolicyManager is now configured to accept messages from:");
    console.log(`   - Source Chain: Sepolia (${SEPOLIA_CHAIN_SELECTOR})`);
    console.log(`   - Sender: PremiumVault (${PREMIUM_VAULT})`);
    console.log("\n🔒 Security checks that will now pass:");
    console.log("   - Source chain allowlist ✅");
    console.log("   - Sender allowlist ✅");

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
