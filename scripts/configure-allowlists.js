const { ethers } = require("hardhat");

async function main() {
  // Get network from environment variable or default to sepolia
  const network = process.env.CONFIGURE_NETWORK || "sepolia";

  if (!["sepolia", "hedera"].includes(network)) {
    console.error("❌ Invalid network. Use 'sepolia' or 'hedera'");
    console.log(
      "   Example: CONFIGURE_NETWORK=sepolia npx hardhat run scripts/configure-allowlists.js --network sepolia"
    );
    console.log(
      "   Example: CONFIGURE_NETWORK=hedera npx hardhat run scripts/configure-allowlists.js --network hedera"
    );
    process.exit(1);
  }

  console.log(
    `🔧 Configuring Cross-Chain Allowlists for ${network.toUpperCase()}...\n`
  );

  // Contract addresses from your deployment
  const PREMIUM_VAULT = "0xc2fE392C66eD17BA2C388A41fee23Ff4Fd4ba037"; // Sepolia
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569"; // Hedera
  const LPVAULT = "0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97"; // Sepolia
  const VOTING_MIRROR = "0xe1C31E56De989192946f096eBA8Ed709C2Ec9003"; // Hedera
  const PAYOUT_VAULT = "0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc"; // Sepolia
  const CLAIM_MANAGER = "0x9D4646f64dF7D98c6a83D60a9Af06c67a9eE0215"; // Hedera

  // CCIP Chain selectors for cross-chain communication
  // These are the official CCIP chain selectors from Chainlink documentation
  const HEDERA_CCIP_SELECTOR = 222782988166878823; // Hedera Testnet CCIP selector
  const SEPOLIA_CCIP_SELECTOR = 16015286601757825753; // Sepolia CCIP chain selector

  // Get signer from Hardhat (will use the private key from hardhat.config.js)
  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  if (network === "sepolia") {
    await configureSepoliaContracts(signer, {
      PREMIUM_VAULT,
      POLICY_MANAGER,
      LPVAULT,
      VOTING_MIRROR,
      PAYOUT_VAULT,
      CLAIM_MANAGER,
      HEDERA_CCIP_SELECTOR,
      SEPOLIA_CCIP_SELECTOR,
    });
  } else if (network === "hedera") {
    await configureHederaContracts(signer, {
      PREMIUM_VAULT,
      POLICY_MANAGER,
      LPVAULT,
      VOTING_MIRROR,
      PAYOUT_VAULT,
      CLAIM_MANAGER,
      HEDERA_CCIP_SELECTOR,
      SEPOLIA_CCIP_SELECTOR,
    });
  }
}

async function configureSepoliaContracts(signer, addresses) {
  console.log("📤 Configuring Sepolia Contracts (Outbound to Hedera)...\n");

  // 1. Configure PremiumVault (Sepolia) → PolicyManager (Hedera)
  console.log("📤 Configuring PremiumVault → PolicyManager...");

  const premiumVault = await ethers.getContractAt(
    "PremiumVault",
    addresses.PREMIUM_VAULT
  );

  // Allow Hedera destination chain
  console.log("   ✅ Allowing Hedera destination chain...");
  const tx1 = await premiumVault.allowlistDestChain(
    addresses.HEDERA_CCIP_SELECTOR,
    true
  );
  await tx1.wait();
  console.log("   📝 Transaction:", tx1.hash);

  // Allow PolicyManager receiver
  console.log("   ✅ Allowing PolicyManager receiver...");
  const policyManagerEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address"],
    [addresses.POLICY_MANAGER]
  );
  console.log("policyManagerEncoded", policyManagerEncoded);
  const tx2 = await premiumVault.allowlistReceiver(policyManagerEncoded, true);
  await tx2.wait();
  console.log("   📝 Transaction:", tx2.hash);

  // Set gas limit for Hedera
  console.log("   ✅ Setting gas limit for Hedera...");
  const tx3 = await premiumVault.setGasLimit(
    addresses.HEDERA_CCIP_SELECTOR,
    200000
  );
  await tx3.wait();
  console.log("   📝 Transaction:", tx3.hash);

  // 2. Configure LPVault (Sepolia) → VotingMirror (Hedera)
  // console.log("\n📤 Configuring LPVault → VotingMirror...");

  // const lpVault = await ethers.getContractAt("LPVault", addresses.LPVAULT);

  // // Set VotingMirror as receiver for Hedera
  // console.log("   ✅ Setting VotingMirror as receiver...");
  // const tx4 = await lpVault.setReceiver(
  //   addresses.HEDERA_CCIP_SELECTOR,
  //   addresses.VOTING_MIRROR
  // );
  // await tx4.wait();
  // console.log("   📝 Transaction:", tx4.hash);

  // Set gas limit for Hedera
  // console.log("   ✅ Setting gas limit for Hedera...");
  // const tx5 = await lpVault.setGasLimit(addresses.HEDERA_CCIP_SELECTOR, 150000);
  // await tx5.wait();
  // console.log("   📝 Transaction:", tx5.hash);

  // // 3. Configure PayoutVault (Sepolia) ← ClaimManager (Hedera)
  // console.log("\n📥 Configuring PayoutVault ← ClaimManager...");

  // const payoutVault = await ethers.getContractAt(
  //   "PayoutVault",
  //   addresses.PAYOUT_VAULT
  // );

  // // Allow Hedera source chain
  // console.log("   ✅ Allowing Hedera source chain...");
  // const tx6 = await payoutVault.allowlistSourceChain(
  //   addresses.HEDERA_CCIP_SELECTOR,
  //   true
  // );
  // await tx6.wait();
  // console.log("   📝 Transaction:", tx6.hash);

  // Allow ClaimManager sender
  // console.log("   ✅ Allowing ClaimManager sender...");
  // const claimManagerEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
  //   ["address"],
  //   [addresses.CLAIM_MANAGER]
  // );
  // console.log("claimManagerEncoded", claimManagerEncoded);
  // const tx7 = await payoutVault.allowlistSender(claimManagerEncoded, true);
  // await tx7.wait();
  // console.log("   📝 Transaction:", tx7.hash);

  // console.log("\n🎉 Sepolia contract configuration complete!");
  // console.log("\n📋 Summary of configured allowlists:");
  // console.log("   • PremiumVault (Sepolia) → PolicyManager (Hedera) ✅");
  // console.log("   • LPVault (Sepolia) → VotingMirror (Hedera) ✅");
  // console.log("   • PayoutVault (Sepolia) ← ClaimManager (Hedera) ✅");
}

async function configureHederaContracts(signer, addresses) {
  console.log("📥 Configuring Hedera Contracts (Inbound from Sepolia)...\n");

  // 1. Configure PolicyManager (Hedera) ← PremiumVault (Sepolia)
  console.log("📥 Configuring PolicyManager ← PremiumVault...");

  const policyManager = await ethers.getContractAt(
    "PolicyManager",
    addresses.POLICY_MANAGER
  );

  // Allow Sepolia source chain
  // console.log("   ✅ Allowing Sepolia source chain...");
  // const tx1 = await policyManager.allowlistSourceChain(
  //   addresses.SEPOLIA_CCIP_SELECTOR,
  //   true
  // );
  // await tx1.wait();
  // console.log("   📝 Transaction:", tx1.hash);

  // Allow PremiumVault sender
  // console.log("   ✅ Allowing PremiumVault sender...");
  // const premiumVaultEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
  //   ["address"],
  //   [addresses.PREMIUM_VAULT]
  // );
  // const tx2 = await policyManager.allowlistSender(premiumVaultEncoded, true);
  // await tx2.wait();
  // console.log("   📝 Transaction:", tx2.hash);

  // 2. Configure VotingMirror (Hedera) ← LPVault (Sepolia)
  console.log("\n📥 Configuring VotingMirror ← LPVault...");

  const votingMirror = await ethers.getContractAt(
    "VotingMirror",
    addresses.VOTING_MIRROR
  );

  // Allow Sepolia source chain
  // console.log("   ✅ Allowing Sepolia source chain...");
  // const tx3 = await votingMirror.allowlistSourceChain(
  //   addresses.SEPOLIA_CCIP_SELECTOR,
  //   true
  // );
  // await tx3.wait();
  // console.log("   📝 Transaction:", tx3.hash);

  // Allow LPVault sender
  // console.log("   ✅ Allowing LPVault sender...");
  // const lpVaultEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
  //   ["address"],
  //   [addresses.LPVAULT]
  // );
  // const tx4 = await votingMirror.allowlistSender(lpVaultEncoded, true);
  // await tx4.wait();
  // console.log("   📝 Transaction:", tx4.hash);

  // 3. Configure ClaimManager (Hedera) → PayoutVault (Sepolia)
  console.log("\n📤 Configuring ClaimManager → PayoutVault...");

  const claimManager = await ethers.getContractAt(
    "ClaimManager",
    addresses.CLAIM_MANAGER
  );

  // Allow Sepolia destination chain
  // console.log("   ✅ Allowing Sepolia destination chain...");
  // const tx5 = await claimManager.allowlistDestChain(
  //   addresses.SEPOLIA_CCIP_SELECTOR,
  //   true
  // );
  // await tx5.wait();
  // console.log("   📝 Transaction:", tx5.hash);

  // Allow PayoutVault receiver
  console.log("   ✅ Allowing PayoutVault receiver...");
  const payoutVaultEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address"],
    [addresses.PAYOUT_VAULT]
  );
  const tx6 = await claimManager.allowlistReceiver(payoutVaultEncoded, true);
  await tx6.wait();
  console.log("   📝 Transaction:", tx6.hash);

  console.log("\n🎉 Hedera contract configuration complete!");
  console.log("\n📋 Summary of configured allowlists:");
  console.log("   • PolicyManager (Hedera) ← PremiumVault (Sepolia) ✅");
  console.log("   • VotingMirror (Hedera) ← LPVault (Sepolia) ✅");
  console.log("   • ClaimManager (Hedera) → PayoutVault (Sepolia) ✅");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
