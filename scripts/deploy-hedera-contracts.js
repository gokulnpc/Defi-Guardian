const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Hedera Contracts...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Network configuration
  const HEDERA_CCIP_ROUTER = "0x0000000000000000000000000000000000000000"; // Placeholder - need actual Hedera CCIP router
  const OWNER = signer.address;

  // Chain selectors
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");
  const SEPOLIA_CHAIN_SELECTOR = BigInt("16015286601757825753");

  try {
    console.log("📋 Deployment Configuration:");
    console.log("=============================");
    console.log(`CCIP Router: ${HEDERA_CCIP_ROUTER}`);
    console.log(`Owner: ${OWNER}`);
    console.log(`Hedera Chain Selector: ${HEDERA_CHAIN_SELECTOR}`);
    console.log(`Sepolia Chain Selector: ${SEPOLIA_CHAIN_SELECTOR}`);

    const deployedAddresses = {};

    // 1. Deploy PolicyManager
    console.log("\n🔨 Deploying PolicyManager...");
    console.log("=============================");
    
    const PolicyManager = await ethers.getContractFactory("PolicyManager");
    const policyManager = await PolicyManager.deploy(HEDERA_CCIP_ROUTER, OWNER);
    await policyManager.waitForDeployment();
    const policyManagerAddress = await policyManager.getAddress();
    deployedAddresses.PolicyManager = policyManagerAddress;
    
    console.log(`✅ PolicyManager deployed to: ${policyManagerAddress}`);
    console.log(`Transaction hash: ${policyManager.deploymentTransaction().hash}`);

    // 2. Deploy VotingMirror
    console.log("\n🔨 Deploying VotingMirror...");
    console.log("============================");
    
    const VotingMirror = await ethers.getContractFactory("VotingMirror");
    const votingMirror = await VotingMirror.deploy(HEDERA_CCIP_ROUTER, OWNER);
    await votingMirror.waitForDeployment();
    const votingMirrorAddress = await votingMirror.getAddress();
    deployedAddresses.VotingMirror = votingMirrorAddress;
    
    console.log(`✅ VotingMirror deployed to: ${votingMirrorAddress}`);
    console.log(`Transaction hash: ${votingMirror.deploymentTransaction().hash}`);

    // 3. Deploy ClaimManager
    console.log("\n🔨 Deploying ClaimManager...");
    console.log("=============================");
    
    const ClaimManager = await ethers.getContractFactory("ClaimManager");
    const claimManager = await ClaimManager.deploy(
      votingMirrorAddress,
      policyManagerAddress,
      HEDERA_CCIP_ROUTER,
      OWNER
    );
    await claimManager.waitForDeployment();
    const claimManagerAddress = await claimManager.getAddress();
    deployedAddresses.ClaimManager = claimManagerAddress;
    
    console.log(`✅ ClaimManager deployed to: ${claimManagerAddress}`);
    console.log(`Transaction hash: ${claimManager.deploymentTransaction().hash}`);

    // 4. Configure PolicyManager
    console.log("\n⚙️ Configuring PolicyManager...");
    console.log("=============================");
    
    // Allowlist Sepolia as source chain
    console.log("🔗 Allowlisting Sepolia as source chain...");
    const tx1 = await policyManager.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
    await tx1.wait();
    console.log(`✅ Source chain allowlisted: ${tx1.hash}`);
    
    // Allowlist PremiumVault as sender (placeholder)
    console.log("🎯 Allowlisting PremiumVault as sender...");
    const premiumVaultSender = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      ["0x0000000000000000000000000000000000000000"] // Placeholder - will be updated
    );
    const tx2 = await policyManager.allowlistSender(premiumVaultSender, true);
    await tx2.wait();
    console.log(`✅ Sender allowlisted: ${tx2.hash}`);

    // 5. Configure VotingMirror
    console.log("\n⚙️ Configuring VotingMirror...");
    console.log("=============================");
    
    // Allowlist Sepolia as source chain
    console.log("🔗 Allowlisting Sepolia as source chain...");
    const tx3 = await votingMirror.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
    await tx3.wait();
    console.log(`✅ Source chain allowlisted: ${tx3.hash}`);
    
    // Allowlist LPVault as sender (placeholder)
    console.log("🎯 Allowlisting LPVault as sender...");
    const lpVaultSender = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      ["0x0000000000000000000000000000000000000000"] // Placeholder - will be updated
    );
    const tx4 = await votingMirror.allowlistSender(lpVaultSender, true);
    await tx4.wait();
    console.log(`✅ Sender allowlisted: ${tx4.hash}`);

    // 6. Configure ClaimManager
    console.log("\n⚙️ Configuring ClaimManager...");
    console.log("=============================");
    
    // Allowlist Sepolia as destination chain
    console.log("🔗 Allowlisting Sepolia as destination chain...");
    const tx5 = await claimManager.allowlistDestChain(SEPOLIA_CHAIN_SELECTOR, true);
    await tx5.wait();
    console.log(`✅ Destination chain allowlisted: ${tx5.hash}`);
    
    // Allowlist PayoutVault as receiver (placeholder)
    console.log("🎯 Allowlisting PayoutVault as receiver...");
    const payoutVaultReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      ["0x0000000000000000000000000000000000000000"] // Placeholder - will be updated
    );
    const tx6 = await claimManager.allowlistReceiver(payoutVaultReceiver, true);
    await tx6.wait();
    console.log(`✅ Receiver allowlisted: ${tx6.hash}`);
    
    // Set gas limit
    console.log("⛽ Setting gas limit for ClaimManager...");
    const tx7 = await claimManager.setGasLimit(SEPOLIA_CHAIN_SELECTOR, 200000);
    await tx7.wait();
    console.log(`✅ Gas limit set: ${tx7.hash}`);

    // 7. Set governance parameters
    console.log("🗳️ Setting governance parameters...");
    const tx8 = await claimManager.setVotingPeriod(300); // 5 minutes
    await tx8.wait();
    console.log(`✅ Voting period set: ${tx8.hash}`);
    
    const tx9 = await claimManager.setQuorum(2000); // 20%
    await tx9.wait();
    console.log(`✅ Quorum set: ${tx9.hash}`);

    console.log("\n🎉 Hedera Deployment Complete!");
    console.log("=============================");
    console.log("📋 Deployed Addresses:");
    console.log("=======================");
    console.log(`PolicyManager: ${deployedAddresses.PolicyManager}`);
    console.log(`VotingMirror: ${deployedAddresses.VotingMirror}`);
    console.log(`ClaimManager: ${deployedAddresses.ClaimManager}`);
    console.log(`CCIP Router: ${HEDERA_CCIP_ROUTER}`);
    
    console.log("\n📋 Configuration Summary:");
    console.log("=========================");
    console.log("✅ All contracts deployed");
    console.log("✅ Sepolia chain selector allowlisted");
    console.log("✅ Gas limits set (200,000 gas)");
    console.log("✅ Governance parameters configured");
    console.log("⚠️  Sepolia contract addresses need to be updated after Sepolia deployment");

    // Save addresses to file
    const fs = require('fs');
    const deploymentData = {
      network: "hedera",
      deployer: signer.address,
      timestamp: new Date().toISOString(),
      addresses: deployedAddresses,
      configuration: {
        ccipRouter: HEDERA_CCIP_ROUTER,
        hederaChainSelector: HEDERA_CHAIN_SELECTOR.toString(),
        sepoliaChainSelector: SEPOLIA_CHAIN_SELECTOR.toString(),
        gasLimit: "200000",
        votingPeriod: "300",
        quorum: "2000"
      }
    };
    
    fs.writeFileSync(
      'deployment-hedera.json', 
      JSON.stringify(deploymentData, null, 2)
    );
    console.log("\n💾 Deployment data saved to: deployment-hedera.json");

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
