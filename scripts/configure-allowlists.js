const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Configuring Cross-Chain Allowlists...\n");

  // Contract addresses from your deployment
  const PREMIUM_VAULT = "0xc2fE392C66eD17BA2C388A41fee23Ff4Fd4ba037"; // Arbitrum
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569"; // Hedera
  const LPVAULT = "0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97"; // Arbitrum
  const VOTING_MIRROR = "0xe1C31E56De989192946f096eBA8Ed709C2Ec9003"; // Hedera
  const PAYOUT_VAULT = "0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc"; // Arbitrum
  const CLAIM_MANAGER = "0x9D4646f64dF7D98c6a83D60a9Af06c67a9eE0215"; // Hedera

  // Chain selectors (you'll need to verify these for your specific networks)
  const HEDERA_CHAIN_SELECTOR = 0x0000000000000000000000000000000000000000000000000000000000000001; // Replace with actual Hedera selector
  const ARBITRUM_CHAIN_SELECTOR = 0x0000000000000000000000000000000000000000000000000000000000000002; // Replace with actual Arbitrum selector

  // Get signer (make sure this is the contract owner)
  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // 1. Configure PremiumVault (Arbitrum) → PolicyManager (Hedera)
  console.log("\n📤 Configuring PremiumVault → PolicyManager...");
  
  const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
  
  // Allow Hedera destination chain
  console.log("   ✅ Allowing Hedera destination chain...");
  const tx1 = await premiumVault.allowlistDestChain(HEDERA_CHAIN_SELECTOR, true);
  await tx1.wait();
  console.log("   📝 Transaction:", tx1.hash);

  // Allow PolicyManager receiver
  console.log("   ✅ Allowing PolicyManager receiver...");
  const policyManagerEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [POLICY_MANAGER]);
  const tx2 = await premiumVault.allowlistReceiver(policyManagerEncoded, true);
  await tx2.wait();
  console.log("   📝 Transaction:", tx2.hash);

  // Set gas limit for Hedera
  console.log("   ✅ Setting gas limit for Hedera...");
  const tx3 = await premiumVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 200000);
  await tx3.wait();
  console.log("   📝 Transaction:", tx3.hash);

  // 2. Configure LPVault (Arbitrum) → VotingMirror (Hedera)
  console.log("\n📤 Configuring LPVault → VotingMirror...");
  
  const lpVault = await ethers.getContractAt("LPVault", LPVAULT);
  
  // Set VotingMirror as receiver for Hedera
  console.log("   ✅ Setting VotingMirror as receiver...");
  const tx4 = await lpVault.setReceiver(HEDERA_CHAIN_SELECTOR, VOTING_MIRROR);
  await tx4.wait();
  console.log("   📝 Transaction:", tx4.hash);

  // Set gas limit for Hedera
  console.log("   ✅ Setting gas limit for Hedera...");
  const tx5 = await lpVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 150000);
  await tx5.wait();
  console.log("   📝 Transaction:", tx5.hash);

  // 3. Configure PolicyManager (Hedera) ← PremiumVault (Arbitrum)
  console.log("\n📥 Configuring PolicyManager ← PremiumVault...");
  
  const policyManager = await ethers.getContractAt("PolicyManager", POLICY_MANAGER);
  
  // Allow Arbitrum source chain
  console.log("   ✅ Allowing Arbitrum source chain...");
  const tx6 = await policyManager.allowlistSourceChain(ARBITRUM_CHAIN_SELECTOR, true);
  await tx6.wait();
  console.log("   📝 Transaction:", tx6.hash);

  // Allow PremiumVault sender
  console.log("   ✅ Allowing PremiumVault sender...");
  const premiumVaultEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [PREMIUM_VAULT]);
  const tx7 = await policyManager.allowlistSender(premiumVaultEncoded, true);
  await tx7.wait();
  console.log("   📝 Transaction:", tx7.hash);

  // 4. Configure VotingMirror (Hedera) ← LPVault (Arbitrum)
  console.log("\n📥 Configuring VotingMirror ← LPVault...");
  
  const votingMirror = await ethers.getContractAt("VotingMirror", VOTING_MIRROR);
  
  // Allow Arbitrum source chain
  console.log("   ✅ Allowing Arbitrum source chain...");
  const tx8 = await votingMirror.allowlistSourceChain(ARBITRUM_CHAIN_SELECTOR, true);
  await tx8.wait();
  console.log("   📝 Transaction:", tx8.hash);

  // Allow LPVault sender
  console.log("   ✅ Allowing LPVault sender...");
  const lpVaultEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [LPVAULT]);
  const tx9 = await votingMirror.allowlistSender(lpVaultEncoded, true);
  await tx9.wait();
  console.log("   📝 Transaction:", tx9.hash);

  // 5. Configure PayoutVault (Arbitrum) ← ClaimManager (Hedera)
  console.log("\n📥 Configuring PayoutVault ← ClaimManager...");
  
  const payoutVault = await ethers.getContractAt("PayoutVault", PAYOUT_VAULT);
  
  // Allow Hedera source chain
  console.log("   ✅ Allowing Hedera source chain...");
  const tx10 = await payoutVault.allowlistSourceChain(HEDERA_CHAIN_SELECTOR, true);
  await tx10.wait();
  console.log("   📝 Transaction:", tx10.hash);

  // Allow ClaimManager sender
  console.log("   ✅ Allowing ClaimManager sender...");
  const claimManagerEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [CLAIM_MANAGER]);
  const tx11 = await payoutVault.allowlistSender(claimManagerEncoded, true);
  await tx11.wait();
  console.log("   📝 Transaction:", tx11.hash);

  console.log("\n🎉 Allowlist configuration complete!");
  console.log("\n📋 Summary of configured allowlists:");
  console.log("   • PremiumVault → PolicyManager ✅");
  console.log("   • LPVault → VotingMirror ✅");
  console.log("   • PolicyManager ← PremiumVault ✅");
  console.log("   • VotingMirror ← LPVault ✅");
  console.log("   • PayoutVault ← ClaimManager ✅");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
