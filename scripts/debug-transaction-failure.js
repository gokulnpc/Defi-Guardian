const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Transaction Failure...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");

  try {
    console.log("📋 Contract Information:");
    console.log("========================");
    console.log(`PremiumVault: ${PREMIUM_VAULT}`);
    console.log(`PYUSD Token: ${PYUSD_TOKEN}`);
    console.log(`Signer: ${signer.address}`);

    const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
    const pyusdToken = await ethers.getContractAt("IERC20", PYUSD_TOKEN);

    // 1. Check basic contract state
    console.log("\n🔍 Basic Contract State:");
    console.log("=========================");
    
    try {
      const owner = await premiumVault.owner();
      console.log(`✅ Owner: ${owner}`);
      console.log(`👤 Signer is owner: ${owner.toLowerCase() === signer.address.toLowerCase()}`);
    } catch (error) {
      console.log(`❌ Owner check failed: ${error.message}`);
    }

    try {
      const router = await premiumVault.router();
      console.log(`✅ CCIP Router: ${router}`);
    } catch (error) {
      console.log(`❌ Router check failed: ${error.message}`);
    }

    try {
      const pyusd = await premiumVault.PYUSD();
      console.log(`✅ PYUSD Token: ${pyusd}`);
    } catch (error) {
      console.log(`❌ PYUSD check failed: ${error.message}`);
    }

    // 2. Check allowlist configuration
    console.log("\n🔍 Allowlist Configuration:");
    console.log("============================");
    
    try {
      const destChainAllowed = await premiumVault.allowlistedDestChains(HEDERA_CHAIN_SELECTOR);
      console.log(`✅ Hedera destination chain allowed: ${destChainAllowed}`);
    } catch (error) {
      console.log(`❌ Destination chain check failed: ${error.message}`);
    }

    try {
      const gasLimit = await premiumVault.gasLimitByChain(HEDERA_CHAIN_SELECTOR);
      console.log(`✅ Gas limit for Hedera: ${gasLimit.toString()}`);
    } catch (error) {
      console.log(`❌ Gas limit check failed: ${error.message}`);
    }

    // 3. Check PYUSD token state
    console.log("\n🔍 PYUSD Token State:");
    console.log("=====================");
    
    try {
      const balance = await pyusdToken.balanceOf(signer.address);
      console.log(`💰 PYUSD Balance: ${ethers.formatUnits(balance, 6)} PYUSD`);
    } catch (error) {
      console.log(`❌ Balance check failed: ${error.message}`);
    }

    try {
      const allowance = await pyusdToken.allowance(signer.address, PREMIUM_VAULT);
      console.log(`✅ PYUSD Allowance: ${ethers.formatUnits(allowance, 6)} PYUSD`);
    } catch (error) {
      console.log(`❌ Allowance check failed: ${error.message}`);
    }

    // 4. Check premium split configuration
    console.log("\n🔍 Premium Split Configuration:");
    console.log("===============================");
    
    try {
      const bpsToLP = await premiumVault.premiumBpsToLP();
      const bpsToReserve = await premiumVault.premiumBpsToReserve();
      console.log(`✅ LP Split: ${bpsToLP} bps (${bpsToLP/100}%)`);
      console.log(`✅ Reserve Split: ${bpsToReserve} bps (${bpsToReserve/100}%)`);
      console.log(`✅ Total: ${bpsToLP + bpsToReserve} bps`);
    } catch (error) {
      console.log(`❌ Split check failed: ${error.message}`);
    }

    // 5. Test with the exact parameters from the frontend
    console.log("\n🧪 Testing with Frontend Parameters:");
    console.log("====================================");
    
    const timestamp = Date.now();
    const poolId = "0x00000004000a364c00000198b66415cc00000000000000000000000000000000";
    const policyRef = "0x00000004000a364c00000198b66415cc00000000000000000000000000000000";
    
    const startTs = BigInt(Math.floor(timestamp / 1000));
    const durationSeconds = BigInt(30) * BigInt(24) * BigInt(60) * BigInt(60); // 30 days
    const endTs = startTs + durationSeconds;

    const policyTerms = {
      poolId,
      buyer: signer.address,
      coverageAmount: ethers.parseEther("11"),
      startTs,
      endTs,
      policyRef,
    };

    const hederaReceiver = `0x000000000000000000000000d1b6bea5a3b3dd4836100f5c55877c59d4666569`;
    const premiumPYUSD = ethers.parseUnits("11", 6); // PYUSD has 6 decimals

    console.log("📋 Test Parameters:");
    console.log("===================");
    console.log(`Pool ID: ${poolId}`);
    console.log(`Buyer: ${policyTerms.buyer}`);
    console.log(`Coverage Amount: ${ethers.formatEther(policyTerms.coverageAmount)} ETH`);
    console.log(`Start TS: ${policyTerms.startTs}`);
    console.log(`End TS: ${policyTerms.endTs}`);
    console.log(`Policy Ref: ${policyTerms.policyRef}`);
    console.log(`Hedera Receiver: ${hederaReceiver}`);
    console.log(`Premium PYUSD: ${ethers.formatEther(premiumPYUSD)} PYUSD`);

    // 6. Test fee estimation
    console.log("\n💰 Testing Fee Estimation:");
    console.log("==========================");
    
    try {
      const fee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        hederaReceiver,
        policyTerms
      );
      console.log(`✅ Fee estimation: ${ethers.formatEther(fee)} ETH`);
      console.log(`💰 Fee in wei: ${fee.toString()}`);
    } catch (error) {
      console.log(`❌ Fee estimation failed: ${error.message}`);
      if (error.data) {
        console.log(`   Error data: ${error.data}`);
      }
    }

    // 7. Check receiver allowlist
    console.log("\n🎯 Checking Receiver Allowlist:");
    console.log("===============================");
    
    try {
      const receiverAllowed = await premiumVault.allowlistedReceivers(hederaReceiver);
      console.log(`✅ Receiver allowlisted: ${receiverAllowed}`);
    } catch (error) {
      console.log(`❌ Receiver check failed: ${error.message}`);
    }

    // 8. Test the actual transaction (dry run)
    console.log("\n🧪 Testing Transaction (Dry Run):");
    console.log("=================================");
    
    try {
      // First, check if we have enough PYUSD
      const balance = await pyusdToken.balanceOf(signer.address);
      if (balance < premiumPYUSD) {
        console.log(`❌ Insufficient PYUSD balance: ${ethers.formatUnits(balance, 6)} < ${ethers.formatUnits(premiumPYUSD, 6)}`);
        console.log(`💡 You need to get more PYUSD tokens`);
      } else {
        console.log(`✅ Sufficient PYUSD balance: ${ethers.formatUnits(balance, 6)} >= ${ethers.formatUnits(premiumPYUSD, 6)}`);
      }

      // Check allowance
      const allowance = await pyusdToken.allowance(signer.address, PREMIUM_VAULT);
      if (allowance < premiumPYUSD) {
        console.log(`❌ Insufficient allowance: ${ethers.formatUnits(allowance, 6)} < ${ethers.formatUnits(premiumPYUSD, 6)}`);
        console.log(`💡 You need to approve PYUSD spending`);
      } else {
        console.log(`✅ Sufficient allowance: ${ethers.formatUnits(allowance, 6)} >= ${ethers.formatUnits(premiumPYUSD, 6)}`);
      }

      // Get fee estimate
      const fee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        hederaReceiver,
        policyTerms
      );

      // Check ETH balance for fee
      const ethBalance = await signer.provider.getBalance(signer.address);
      if (ethBalance < fee) {
        console.log(`❌ Insufficient ETH for fee: ${ethers.formatEther(ethBalance)} < ${ethers.formatEther(fee)}`);
        console.log(`💡 You need more ETH to pay the CCIP fee`);
      } else {
        console.log(`✅ Sufficient ETH for fee: ${ethers.formatEther(ethBalance)} >= ${ethers.formatEther(fee)}`);
      }

    } catch (error) {
      console.log(`❌ Transaction check failed: ${error.message}`);
      if (error.data) {
        console.log(`   Error data: ${error.data}`);
      }
    }

    // 9. Provide solutions
    console.log("\n🔧 Potential Solutions:");
    console.log("=======================");
    console.log("1. Check PYUSD balance and allowance");
    console.log("2. Ensure sufficient ETH for CCIP fee");
    console.log("3. Verify receiver is allowlisted");
    console.log("4. Check gas limits and chain selectors");
    console.log("5. Verify PolicyManager is properly configured on Hedera");

    console.log("\n📋 Debug Summary:");
    console.log("=================");
    console.log("✅ Contract state checked");
    console.log("✅ Allowlist configuration verified");
    console.log("✅ Token balances and allowances checked");
    console.log("✅ Fee estimation tested");
    console.log("✅ Transaction parameters validated");

  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
