const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Fixed PremiumVault Contract...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  try {
    // Contract addresses (same as current deployment)
    const ROUTER = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"; // Sepolia CCIP Router
    const PYUSD = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD on Sepolia
    const LP_VAULT = "0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97";
    const PAYOUT_VAULT = "0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc";
    const OWNER = signer.address;

    console.log("📋 Deployment Parameters:");
    console.log("=========================");
    console.log(`Router: ${ROUTER}`);
    console.log(`PYUSD: ${PYUSD}`);
    console.log(`LP Vault: ${LP_VAULT}`);
    console.log(`Payout Vault: ${PAYOUT_VAULT}`);
    console.log(`Owner: ${OWNER}`);

    // Deploy the fixed contract
    console.log("\n🔨 Deploying PremiumVault...");
    console.log("=============================");
    
    const PremiumVault = await ethers.getContractFactory("PremiumVault");
    const premiumVault = await PremiumVault.deploy(
      ROUTER,
      PYUSD,
      LP_VAULT,
      PAYOUT_VAULT,
      OWNER
    );

    await premiumVault.waitForDeployment();
    const address = await premiumVault.getAddress();
    
    console.log(`✅ PremiumVault deployed to: ${address}`);
    console.log(`Transaction hash: ${premiumVault.deploymentTransaction().hash}`);

    // Configure the new contract
    console.log("\n⚙️ Configuring New Contract...");
    console.log("=============================");
    
    const HEDERA_CCIP_SELECTOR = BigInt("222782988166878823");
    const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";
    
    // Allowlist the chain selector
    console.log("🔗 Allowlisting Hedera chain selector...");
    const tx1 = await premiumVault.allowlistDestChain(HEDERA_CCIP_SELECTOR, true);
    await tx1.wait();
    console.log(`✅ Chain allowlisted: ${tx1.hash}`);
    
    // Allowlist the receiver
    console.log("🎯 Allowlisting PolicyManager receiver...");
    const policyManagerEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [POLICY_MANAGER]
    );
    const tx2 = await premiumVault.allowlistReceiver(policyManagerEncoded, true);
    await tx2.wait();
    console.log(`✅ Receiver allowlisted: ${tx2.hash}`);
    
    // Set gas limit
    console.log("⛽ Setting gas limit...");
    const tx3 = await premiumVault.setGasLimit(HEDERA_CCIP_SELECTOR, 200000);
    await tx3.wait();
    console.log(`✅ Gas limit set: ${tx3.hash}`);

    console.log("\n🎉 Fixed Contract Deployment Complete!");
    console.log("=====================================");
    console.log(`Contract address: ${address}`);
    console.log(`Owner: ${OWNER}`);
    console.log(`Chain selector: ${HEDERA_CCIP_SELECTOR}`);
    console.log(`PolicyManager: ${POLICY_MANAGER}`);

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
