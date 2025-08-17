const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Fixed Contract with Chainlink Imports...\n");

  const FIXED_PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  try {
    const premiumVault = await ethers.getContractAt("PremiumVault", FIXED_PREMIUM_VAULT);

    const chainSelector = BigInt("222782988166878823");
    
    console.log("📋 Testing Fixed Contract:");
    console.log("===========================");
    console.log(`Contract address: ${FIXED_PREMIUM_VAULT}`);
    console.log(`Chain selector: ${chainSelector}`);
    
    // Check allowlist status
    console.log("\n🔍 Allowlist Status:");
    console.log("====================");
    
    try {
      const allowed = await premiumVault.allowlistedDestChains(chainSelector);
      console.log(`Chain allowed: ${allowed}`);
    } catch (error) {
      console.log(`Chain allowlist error: ${error.message}`);
    }
    
    try {
      const gasLimit = await premiumVault.gasLimitByChain(chainSelector);
      console.log(`Gas limit: ${gasLimit.toString()}`);
    } catch (error) {
      console.log(`Gas limit error: ${error.message}`);
    }
    
    // Test quoteCCIPFee with the original parameters from the frontend
    console.log("\n🧪 Testing quoteCCIPFee:");
    console.log("=========================");
    
    const timestamp = Date.now();
    const poolId = "0x00000004000a364c00000198b66415cc00000000000000000000000000000000";
    const policyRef = "0x00000004000a364c00000198b66415cc00000000000000000000000000000000";
    
    const startTs = BigInt(Math.floor(timestamp / 1000));
    const durationSeconds = BigInt(30) * BigInt(24) * BigInt(60) * BigInt(60); // 30 days
    const endTs = startTs + durationSeconds;

    const policyTerms = {
      poolId,
      buyer: "0xd9611B36CF494032916863c4CD3D7c2f5e728745",
      coverageAmount: ethers.parseEther("11"),
      startTs,
      endTs,
      policyRef,
    };

    const hederaReceiver = `0x000000000000000000000000d1b6bea5a3b3dd4836100f5c55877c59d4666569`;

    console.log("📋 Test Parameters:");
    console.log("===================");
    console.log(`Pool ID: ${poolId}`);
    console.log(`Buyer: ${policyTerms.buyer}`);
    console.log(`Coverage Amount: ${ethers.formatEther(policyTerms.coverageAmount)} ETH`);
    console.log(`Start TS: ${policyTerms.startTs}`);
    console.log(`End TS: ${policyTerms.endTs}`);
    console.log(`Policy Ref: ${policyTerms.policyRef}`);
    console.log(`Hedera Receiver: ${hederaReceiver}`);

    try {
      const fee = await premiumVault.quoteCCIPFee(
        chainSelector,
        hederaReceiver,
        policyTerms
      );
      console.log(`\n✅ quoteCCIPFee SUCCESS: ${ethers.formatEther(fee)} ETH`);
      console.log(`Fee in wei: ${fee.toString()}`);
    } catch (error) {
      console.log(`\n❌ quoteCCIPFee FAILED: ${error.message}`);
      
      if (error.data) {
        console.log(`   Error data: ${error.data}`);
        
        const errorSignatures = {
          "0x5247fdce": "InvalidExtraArgsTag (CCIP Router)",
          "0x8f4eb604": "ReceiverNotAllowlisted", 
          "0x1f2a2005": "NoGasLimitForChain"
        };
        
        const signature = error.data.slice(0, 10);
        const knownError = errorSignatures[signature];
        if (knownError) {
          console.log(`   Decoded error: ${knownError}`);
        }
      }
    }

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
