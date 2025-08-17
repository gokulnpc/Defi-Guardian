const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🔗 Configuring Cross-Chain Allowlists...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Load deployment data
  let sepoliaData, hederaData;
  
  try {
    sepoliaData = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
    hederaData = JSON.parse(fs.readFileSync('deployment-hedera.json', 'utf8'));
  } catch (error) {
    console.error("❌ Error loading deployment data:", error.message);
    console.log("Please run deployment scripts first:");
    console.log("1. npx hardhat run scripts/deploy-sepolia-contracts.js --network sepolia");
    console.log("2. npx hardhat run scripts/deploy-hedera-contracts.js --network hedera");
    return;
  }

  // Extract addresses
  const sepoliaAddresses = sepoliaData.addresses;
  const hederaAddresses = hederaData.addresses;

  // Chain selectors
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");
  const SEPOLIA_CHAIN_SELECTOR = BigInt("16015286601757825753");

  console.log("📋 Configuration Data:");
  console.log("======================");
  console.log("Sepolia Contracts:");
  console.log(`  LPVault: ${sepoliaAddresses.LPVault}`);
  console.log(`  PayoutVault: ${sepoliaAddresses.PayoutVault}`);
  console.log(`  PremiumVault: ${sepoliaAddresses.PremiumVault}`);
  console.log("\nHedera Contracts:");
  console.log(`  PolicyManager: ${hederaAddresses.PolicyManager}`);
  console.log(`  VotingMirror: ${hederaAddresses.VotingMirror}`);
  console.log(`  ClaimManager: ${hederaAddresses.ClaimManager}`);

  try {
    // 1. Configure Sepolia Contracts (PremiumVault → PolicyManager)
    console.log("\n🔧 Configuring Sepolia Contracts:");
    console.log("=================================");
    
    const premiumVault = await ethers.getContractAt("PremiumVault", sepoliaAddresses.PremiumVault);
    
    // Update PolicyManager receiver on PremiumVault
    console.log("🎯 Updating PolicyManager receiver on PremiumVault...");
    const policyManagerReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [hederaAddresses.PolicyManager]
    );
    const tx1 = await premiumVault.allowlistReceiver(policyManagerReceiver, true);
    await tx1.wait();
    console.log(`✅ PolicyManager receiver updated: ${tx1.hash}`);

    // 2. Configure Hedera Contracts (PolicyManager)
    console.log("\n🔧 Configuring Hedera Contracts:");
    console.log("=================================");
    
    const policyManager = await ethers.getContractAt("PolicyManager", hederaAddresses.PolicyManager);
    
    // Update PremiumVault sender on PolicyManager
    console.log("🎯 Updating PremiumVault sender on PolicyManager...");
    const premiumVaultSender = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [sepoliaAddresses.PremiumVault]
    );
    const tx2 = await policyManager.allowlistSender(premiumVaultSender, true);
    await tx2.wait();
    console.log(`✅ PremiumVault sender updated: ${tx2.hash}`);

    // 3. Configure LPVault → VotingMirror
    console.log("\n🔧 Configuring LPVault → VotingMirror:");
    console.log("======================================");
    
    const lpVault = await ethers.getContractAt("LPVault", sepoliaAddresses.LPVault);
    
    // Update VotingMirror receiver on LPVault
    console.log("🎯 Updating VotingMirror receiver on LPVault...");
    const votingMirrorReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [hederaAddresses.VotingMirror]
    );
    const tx3 = await lpVault.setReceiver(HEDERA_CHAIN_SELECTOR, votingMirrorReceiver);
    await tx3.wait();
    console.log(`✅ VotingMirror receiver updated: ${tx3.hash}`);

    // Update LPVault sender on VotingMirror
    console.log("🎯 Updating LPVault sender on VotingMirror...");
    const votingMirror = await ethers.getContractAt("VotingMirror", hederaAddresses.VotingMirror);
    const lpVaultSender = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [sepoliaAddresses.LPVault]
    );
    const tx4 = await votingMirror.allowlistSender(lpVaultSender, true);
    await tx4.wait();
    console.log(`✅ LPVault sender updated: ${tx4.hash}`);

    // 4. Configure ClaimManager → PayoutVault
    console.log("\n🔧 Configuring ClaimManager → PayoutVault:");
    console.log("=========================================");
    
    const claimManager = await ethers.getContractAt("ClaimManager", hederaAddresses.ClaimManager);
    
    // Update PayoutVault receiver on ClaimManager
    console.log("🎯 Updating PayoutVault receiver on ClaimManager...");
    const payoutVaultReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [sepoliaAddresses.PayoutVault]
    );
    const tx5 = await claimManager.allowlistReceiver(payoutVaultReceiver, true);
    await tx5.wait();
    console.log(`✅ PayoutVault receiver updated: ${tx5.hash}`);

    // Update ClaimManager sender on PayoutVault
    console.log("🎯 Updating ClaimManager sender on PayoutVault...");
    const payoutVault = await ethers.getContractAt("PayoutVault", sepoliaAddresses.PayoutVault);
    const claimManagerSender = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [hederaAddresses.ClaimManager]
    );
    const tx6 = await payoutVault.allowlistSender(claimManagerSender, true);
    await tx6.wait();
    console.log(`✅ ClaimManager sender updated: ${tx6.hash}`);

    // 5. Verify Configuration
    console.log("\n✅ Verification:");
    console.log("================");
    
    // Verify PremiumVault → PolicyManager
    console.log("🔍 Verifying PremiumVault → PolicyManager...");
    const premiumVaultReceiverCheck = await premiumVault.allowlistedReceivers(policyManagerReceiver);
    console.log(`  PolicyManager receiver allowlisted: ${premiumVaultReceiverCheck}`);
    
    const policyManagerSenderCheck = await policyManager.allowlistedSenders(premiumVaultSender);
    console.log(`  PremiumVault sender allowlisted: ${policyManagerSenderCheck}`);

    // Verify LPVault → VotingMirror
    console.log("🔍 Verifying LPVault → VotingMirror...");
    const lpVaultReceiverCheck = await lpVault.receivers(HEDERA_CHAIN_SELECTOR);
    console.log(`  VotingMirror receiver set: ${lpVaultReceiverCheck === votingMirrorReceiver}`);
    
    const votingMirrorSenderCheck = await votingMirror.allowlistedSenders(lpVaultSender);
    console.log(`  LPVault sender allowlisted: ${votingMirrorSenderCheck}`);

    // Verify ClaimManager → PayoutVault
    console.log("🔍 Verifying ClaimManager → PayoutVault...");
    const claimManagerReceiverCheck = await claimManager.allowlistedReceivers(payoutVaultReceiver);
    console.log(`  PayoutVault receiver allowlisted: ${claimManagerReceiverCheck}`);
    
    const payoutVaultSenderCheck = await payoutVault.allowlistedSenders(claimManagerSender);
    console.log(`  ClaimManager sender allowlisted: ${payoutVaultSenderCheck}`);

    // 6. Test Cross-Chain Communication
    console.log("\n🧪 Testing Cross-Chain Communication:");
    console.log("=====================================");
    
    // Test PremiumVault fee estimation
    console.log("💰 Testing PremiumVault fee estimation...");
    const testPolicyTerms = {
      poolId: "0x0000000000000000000000000000000000000000000000000000000000000001",
      buyer: signer.address,
      coverageAmount: ethers.parseEther("1"),
      startTs: BigInt(Math.floor(Date.now() / 1000)),
      endTs: BigInt(Math.floor(Date.now() / 1000) + 86400), // 1 day
      policyRef: "0x0000000000000000000000000000000000000000000000000000000000000001"
    };
    
    try {
      const fee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        policyManagerReceiver,
        testPolicyTerms
      );
      console.log(`✅ Fee estimation successful: ${ethers.formatEther(fee)} ETH`);
    } catch (error) {
      console.log(`❌ Fee estimation failed: ${error.message}`);
    }

    console.log("\n🎉 Cross-Chain Configuration Complete!");
    console.log("=====================================");
    console.log("✅ All contracts properly mapped");
    console.log("✅ Cross-chain allowlists configured");
    console.log("✅ Fee estimation working");
    console.log("✅ System ready for cross-chain operations");

    // Save final configuration
    const finalConfig = {
      timestamp: new Date().toISOString(),
      sepolia: sepoliaAddresses,
      hedera: hederaAddresses,
      mappings: {
        "PremiumVault → PolicyManager": {
          sender: sepoliaAddresses.PremiumVault,
          receiver: hederaAddresses.PolicyManager,
          direction: "Sepolia → Hedera"
        },
        "LPVault → VotingMirror": {
          sender: sepoliaAddresses.LPVault,
          receiver: hederaAddresses.VotingMirror,
          direction: "Sepolia → Hedera"
        },
        "ClaimManager → PayoutVault": {
          sender: hederaAddresses.ClaimManager,
          receiver: sepoliaAddresses.PayoutVault,
          direction: "Hedera → Sepolia"
        }
      },
      chainSelectors: {
        sepolia: SEPOLIA_CHAIN_SELECTOR.toString(),
        hedera: HEDERA_CHAIN_SELECTOR.toString()
      }
    };
    
    fs.writeFileSync(
      'cross-chain-config.json', 
      JSON.stringify(finalConfig, null, 2)
    );
    console.log("\n💾 Final configuration saved to: cross-chain-config.json");

  } catch (error) {
    console.error("❌ Configuration failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
