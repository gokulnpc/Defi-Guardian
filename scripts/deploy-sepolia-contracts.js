const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Sepolia Contracts...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Network configuration
  const SEPOLIA_CCIP_ROUTER = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59";
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const OWNER = signer.address;

  // Chain selectors
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");
  const SEPOLIA_CHAIN_SELECTOR = BigInt("16015286601757825753");

  try {
    console.log("📋 Deployment Configuration:");
    console.log("=============================");
    console.log(`CCIP Router: ${SEPOLIA_CCIP_ROUTER}`);
    console.log(`PYUSD Token: ${PYUSD_TOKEN}`);
    console.log(`Owner: ${OWNER}`);
    console.log(`Hedera Chain Selector: ${HEDERA_CHAIN_SELECTOR}`);
    console.log(`Sepolia Chain Selector: ${SEPOLIA_CHAIN_SELECTOR}`);

    const deployedAddresses = {};

    // 1. Deploy LPVault
    console.log("\n🔨 Deploying LPVault...");
    console.log("=========================");
    
    const LPVault = await ethers.getContractFactory("LPVault");
    const lpVault = await LPVault.deploy(PYUSD_TOKEN, SEPOLIA_CCIP_ROUTER, OWNER);
    await lpVault.waitForDeployment();
    const lpVaultAddress = await lpVault.getAddress();
    deployedAddresses.LPVault = lpVaultAddress;
    
    console.log(`✅ LPVault deployed to: ${lpVaultAddress}`);
    console.log(`Transaction hash: ${lpVault.deploymentTransaction().hash}`);

    // 2. Deploy PayoutVault
    console.log("\n🔨 Deploying PayoutVault...");
    console.log("============================");
    
    const PayoutVault = await ethers.getContractFactory("PayoutVault");
    const payoutVault = await PayoutVault.deploy(PYUSD_TOKEN, SEPOLIA_CCIP_ROUTER, OWNER);
    await payoutVault.waitForDeployment();
    const payoutVaultAddress = await payoutVault.getAddress();
    deployedAddresses.PayoutVault = payoutVaultAddress;
    
    console.log(`✅ PayoutVault deployed to: ${payoutVaultAddress}`);
    console.log(`Transaction hash: ${payoutVault.deploymentTransaction().hash}`);

    // 3. Deploy PremiumVault
    console.log("\n🔨 Deploying PremiumVault...");
    console.log("=============================");
    
    const PremiumVault = await ethers.getContractFactory("PremiumVault");
    const premiumVault = await PremiumVault.deploy(
      SEPOLIA_CCIP_ROUTER,
      PYUSD_TOKEN,
      lpVaultAddress,
      payoutVaultAddress,
      OWNER
    );
    await premiumVault.waitForDeployment();
    const premiumVaultAddress = await premiumVault.getAddress();
    deployedAddresses.PremiumVault = premiumVaultAddress;
    
    console.log(`✅ PremiumVault deployed to: ${premiumVaultAddress}`);
    console.log(`Transaction hash: ${premiumVault.deploymentTransaction().hash}`);

    // 4. Configure LPVault
    console.log("\n⚙️ Configuring LPVault...");
    console.log("=========================");
    
    // Set receiver for Hedera (VotingMirror)
    console.log("🎯 Setting Hedera receiver for LPVault...");
    const votingMirrorReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      ["0x0000000000000000000000000000000000000000"] // Placeholder - will be updated
    );
    const tx1 = await lpVault.setReceiver(HEDERA_CHAIN_SELECTOR, votingMirrorReceiver);
    await tx1.wait();
    console.log(`✅ Hedera receiver set: ${tx1.hash}`);
    
    // Set gas limit for Hedera
    console.log("⛽ Setting gas limit for LPVault...");
    const tx2 = await lpVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 200000);
    await tx2.wait();
    console.log(`✅ Gas limit set: ${tx2.hash}`);

    // 5. Configure PayoutVault
    console.log("\n⚙️ Configuring PayoutVault...");
    console.log("=============================");
    
    // Allowlist Hedera as source chain
    console.log("🔗 Allowlisting Hedera as source chain...");
    const tx3 = await payoutVault.allowlistSourceChain(HEDERA_CHAIN_SELECTOR, true);
    await tx3.wait();
    console.log(`✅ Source chain allowlisted: ${tx3.hash}`);
    
    // Allowlist ClaimManager as sender (placeholder)
    console.log("🎯 Allowlisting ClaimManager as sender...");
    const claimManagerSender = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      ["0x0000000000000000000000000000000000000000"] // Placeholder - will be updated
    );
    const tx4 = await payoutVault.allowlistSender(claimManagerSender, true);
    await tx4.wait();
    console.log(`✅ Sender allowlisted: ${tx4.hash}`);
    
    // Set gas limit
    console.log("⛽ Setting gas limit for PayoutVault...");
    const tx5 = await payoutVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 200000);
    await tx5.wait();
    console.log(`✅ Gas limit set: ${tx5.hash}`);

    // 6. Configure PremiumVault
    console.log("\n⚙️ Configuring PremiumVault...");
    console.log("===============================");
    
    // Allowlist Hedera as destination chain
    console.log("🔗 Allowlisting Hedera as destination chain...");
    const tx6 = await premiumVault.allowlistDestChain(HEDERA_CHAIN_SELECTOR, true);
    await tx6.wait();
    console.log(`✅ Destination chain allowlisted: ${tx6.hash}`);
    
    // Allowlist PolicyManager as receiver (placeholder)
    console.log("🎯 Allowlisting PolicyManager as receiver...");
    const policyManagerReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      ["0x0000000000000000000000000000000000000000"] // Placeholder - will be updated
    );
    const tx7 = await premiumVault.allowlistReceiver(policyManagerReceiver, true);
    await tx7.wait();
    console.log(`✅ Receiver allowlisted: ${tx7.hash}`);
    
    // Set gas limit
    console.log("⛽ Setting gas limit for PremiumVault...");
    const tx8 = await premiumVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 200000);
    await tx8.wait();
    console.log(`✅ Gas limit set: ${tx8.hash}`);

    // 7. Set premium split (70% LP, 30% Reserve)
    console.log("💰 Setting premium split...");
    const tx9 = await premiumVault.setSplit(7000, 3000); // 70% LP, 30% Reserve
    await tx9.wait();
    console.log(`✅ Premium split set: ${tx9.hash}`);

    console.log("\n🎉 Sepolia Deployment Complete!");
    console.log("===============================");
    console.log("📋 Deployed Addresses:");
    console.log("=======================");
    console.log(`LPVault: ${deployedAddresses.LPVault}`);
    console.log(`PayoutVault: ${deployedAddresses.PayoutVault}`);
    console.log(`PremiumVault: ${deployedAddresses.PremiumVault}`);
    console.log(`PYUSD Token: ${PYUSD_TOKEN}`);
    console.log(`CCIP Router: ${SEPOLIA_CCIP_ROUTER}`);
    
    console.log("\n📋 Configuration Summary:");
    console.log("=========================");
    console.log("✅ All contracts deployed");
    console.log("✅ Hedera chain selector allowlisted");
    console.log("✅ Gas limits set (200,000 gas)");
    console.log("✅ Premium split configured (70% LP, 30% Reserve)");
    console.log("⚠️  Hedera contract addresses need to be updated after Hedera deployment");

    // Save addresses to file
    const fs = require('fs');
    const deploymentData = {
      network: "sepolia",
      deployer: signer.address,
      timestamp: new Date().toISOString(),
      addresses: deployedAddresses,
      configuration: {
        ccipRouter: SEPOLIA_CCIP_ROUTER,
        pyusdToken: PYUSD_TOKEN,
        hederaChainSelector: HEDERA_CHAIN_SELECTOR.toString(),
        sepoliaChainSelector: SEPOLIA_CHAIN_SELECTOR.toString(),
        gasLimit: "200000",
        premiumSplit: { lp: 7000, reserve: 3000 }
      }
    };
    
    fs.writeFileSync(
      'deployment-sepolia.json', 
      JSON.stringify(deploymentData, null, 2)
    );
    console.log("\n💾 Deployment data saved to: deployment-sepolia.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
