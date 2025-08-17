const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Small Coverage Purchase...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");

  try {
    console.log("📋 Test Configuration:");
    console.log("======================");
    console.log(`PremiumVault: ${PREMIUM_VAULT}`);
    console.log(`PYUSD Token: ${PYUSD_TOKEN}`);

    const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
    const pyusdToken = await ethers.getContractAt("IERC20", PYUSD_TOKEN);

    // Check current balances
    console.log("\n💰 Current Balances:");
    console.log("====================");
    
    const pyusdBalance = await pyusdToken.balanceOf(signer.address);
    const ethBalance = await signer.provider.getBalance(signer.address);
    
    console.log(`PYUSD Balance: ${ethers.formatEther(pyusdBalance)} PYUSD`);
    console.log(`ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    // Test with very small amount (0.0001 PYUSD)
    const smallPremium = ethers.parseEther("0.0001"); // 0.0001 PYUSD
    const smallCoverage = ethers.parseEther("0.001"); // 0.001 ETH coverage

    console.log(`\n🧪 Testing with Small Amount:`);
    console.log(`Premium: ${ethers.formatEther(smallPremium)} PYUSD`);
    console.log(`Coverage: ${ethers.formatEther(smallCoverage)} ETH`);

    // Check if we have enough PYUSD
    if (pyusdBalance < smallPremium) {
      console.log(`❌ Insufficient PYUSD: ${ethers.formatEther(pyusdBalance)} < ${ethers.formatEther(smallPremium)}`);
      console.log(`💡 You need at least ${ethers.formatEther(smallPremium)} PYUSD to test`);
      return;
    }

    // Check allowance
    const allowance = await pyusdToken.allowance(signer.address, PREMIUM_VAULT);
    if (allowance < smallPremium) {
      console.log(`\n🔧 Approving PYUSD spending...`);
      const approveTx = await pyusdToken.approve(PREMIUM_VAULT, smallPremium);
      await approveTx.wait();
      console.log(`✅ PYUSD approved: ${approveTx.hash}`);
    } else {
      console.log(`✅ PYUSD already approved: ${ethers.formatEther(allowance)} PYUSD`);
    }

    // Prepare test parameters
    const timestamp = Date.now();
    const poolId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const policyRef = "0x0000000000000000000000000000000000000000000000000000000000000001";
    
    const startTs = BigInt(Math.floor(timestamp / 1000));
    const durationSeconds = BigInt(1) * BigInt(24) * BigInt(60) * BigInt(60); // 1 day
    const endTs = startTs + durationSeconds;

    const policyTerms = {
      poolId,
      buyer: signer.address,
      coverageAmount: smallCoverage,
      startTs,
      endTs,
      policyRef,
    };

    const hederaReceiver = `0x000000000000000000000000d1b6bea5a3b3dd4836100f5c55877c59d4666569`;

    // Test fee estimation
    console.log("\n💰 Testing Fee Estimation:");
    console.log("==========================");
    
    try {
      const fee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        hederaReceiver,
        policyTerms
      );
      console.log(`✅ Fee estimation: ${ethers.formatEther(fee)} ETH`);
      
      // Check if we have enough ETH for fee
      if (ethBalance < fee) {
        console.log(`❌ Insufficient ETH for fee: ${ethers.formatEther(ethBalance)} < ${ethers.formatEther(fee)}`);
        return;
      }
      
      console.log(`✅ Sufficient ETH for fee: ${ethers.formatEther(ethBalance)} >= ${ethers.formatEther(fee)}`);
      
    } catch (error) {
      console.log(`❌ Fee estimation failed: ${error.message}`);
      return;
    }

    // Test the actual transaction
    console.log("\n🚀 Testing Coverage Purchase:");
    console.log("=============================");
    
    try {
      const fee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        hederaReceiver,
        policyTerms
      );

      console.log(`📋 Transaction Parameters:`);
      console.log(`  Premium: ${ethers.formatEther(smallPremium)} PYUSD`);
      console.log(`  Coverage: ${ethers.formatEther(smallCoverage)} ETH`);
      console.log(`  Fee: ${ethers.formatEther(fee)} ETH`);
      console.log(`  Duration: 1 day`);

      const tx = await premiumVault.buyCoverage(
        HEDERA_CHAIN_SELECTOR,
        hederaReceiver,
        policyTerms,
        smallPremium,
        { value: fee }
      );

      console.log(`✅ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check for events
      const events = receipt.logs.map(log => {
        try {
          return premiumVault.interface.parseLog(log);
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      console.log(`📊 Events emitted: ${events.length}`);
      events.forEach((event, index) => {
        console.log(`  Event ${index + 1}: ${event.name}`);
      });

    } catch (error) {
      console.log(`❌ Transaction failed: ${error.message}`);
      
      if (error.data) {
        console.log(`📄 Error data: ${error.data}`);
        
        // Try to decode error
        const errorSignatures = {
          "0x5247fdce": "InvalidExtraArgsTag (CCIP Router)",
          "0x8f4eb604": "ReceiverNotAllowlisted", 
          "0x1f2a2005": "NoGasLimitForChain",
          "0xea553b34": "DestNotAllowlisted",
          "0x4e487b71": "InvalidAmount",
          "0x8456cb59": "NotEnoughNative",
          "0x13be252b": "Unknown error - check contract state"
        };
        
        const signature = error.data.slice(0, 10);
        const knownError = errorSignatures[signature];
        if (knownError) {
          console.log(`🔍 Decoded error: ${knownError}`);
        } else {
          console.log(`❓ Unknown error signature: ${signature}`);
        }
      }
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
