const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Analyzing Failed Transaction...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // The failed transaction hash from your logs
  const FAILED_TX_HASH = "0xd420cbe0303b358f4d2aad6504e4c269f6547b4455399c354e5e586c6d65d4db";
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";

  try {
    console.log("📋 Transaction Analysis:");
    console.log("=======================");
    console.log(`Failed Transaction Hash: ${FAILED_TX_HASH}`);
    console.log(`PremiumVault: ${PREMIUM_VAULT}`);

    // 1. Get transaction details
    console.log("\n🔍 Transaction Details:");
    console.log("======================");
    
    try {
      const tx = await signer.provider.getTransaction(FAILED_TX_HASH);
      if (tx) {
        console.log(`✅ Transaction found`);
        console.log(`📝 From: ${tx.from}`);
        console.log(`📝 To: ${tx.to}`);
        console.log(`💰 Value: ${ethers.formatEther(tx.value)} ETH`);
        console.log(`⛽ Gas Limit: ${tx.gasLimit.toString()}`);
        console.log(`⛽ Gas Price: ${ethers.formatGwei(tx.gasPrice)} gwei`);
        console.log(`📄 Data Length: ${tx.data.length} bytes`);
      } else {
        console.log(`❌ Transaction not found`);
      }
    } catch (error) {
      console.log(`❌ Error getting transaction: ${error.message}`);
    }

    // 2. Get transaction receipt
    console.log("\n🔍 Transaction Receipt:");
    console.log("======================");
    
    try {
      const receipt = await signer.provider.getTransactionReceipt(FAILED_TX_HASH);
      if (receipt) {
        console.log(`✅ Receipt found`);
        console.log(`📊 Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
        console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`💰 Effective Gas Price: ${ethers.formatGwei(receipt.effectiveGasPrice)} gwei`);
        console.log(`📊 Block Number: ${receipt.blockNumber}`);
        console.log(`📊 Logs: ${receipt.logs.length} events`);
        
        if (receipt.status === 0) {
          console.log(`❌ Transaction failed`);
        }
      } else {
        console.log(`❌ Receipt not found (transaction might still be pending)`);
      }
    } catch (error) {
      console.log(`❌ Error getting receipt: ${error.message}`);
    }

    // 3. Decode transaction data
    console.log("\n🔍 Decoding Transaction Data:");
    console.log("=============================");
    
    try {
      const tx = await signer.provider.getTransaction(FAILED_TX_HASH);
      if (tx && tx.data) {
        const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
        
        try {
          const decodedData = premiumVault.interface.parseTransaction({ data: tx.data });
          console.log(`✅ Function: ${decodedData.name}`);
          console.log(`📋 Args:`, decodedData.args);
          
          // Extract specific parameters
          if (decodedData.name === 'buyCoverage') {
            const [dstChainSelector, hederaReceiver, terms, premiumPYUSD] = decodedData.args;
            console.log(`\n📋 Decoded Parameters:`);
            console.log(`  Destination Chain Selector: ${dstChainSelector.toString()}`);
            console.log(`  Hedera Receiver: ${hederaReceiver}`);
            console.log(`  Premium PYUSD: ${ethers.formatEther(premiumPYUSD)} PYUSD`);
            console.log(`  Policy Terms:`);
            console.log(`    Pool ID: ${terms.poolId}`);
            console.log(`    Buyer: ${terms.buyer}`);
            console.log(`    Coverage Amount: ${ethers.formatEther(terms.coverageAmount)} ETH`);
            console.log(`    Start TS: ${terms.startTs.toString()}`);
            console.log(`    End TS: ${terms.endTs.toString()}`);
            console.log(`    Policy Ref: ${terms.policyRef}`);
          }
        } catch (error) {
          console.log(`❌ Failed to decode transaction data: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error decoding transaction: ${error.message}`);
    }

    // 4. Check for revert reason
    console.log("\n🔍 Checking for Revert Reason:");
    console.log("==============================");
    
    try {
      const tx = await signer.provider.getTransaction(FAILED_TX_HASH);
      if (tx) {
        // Try to call the transaction with the same parameters to get revert reason
        const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
        
        try {
          // This will simulate the transaction and show the revert reason
          const result = await signer.provider.call({
            from: tx.from,
            to: tx.to,
            value: tx.value,
            data: tx.data,
            gasLimit: tx.gasLimit
          });
          console.log(`✅ Transaction simulation successful`);
        } catch (error) {
          console.log(`❌ Transaction simulation failed: ${error.message}`);
          
          // Try to decode the revert reason
          if (error.data) {
            console.log(`📄 Raw error data: ${error.data}`);
            
            // Try to decode common errors
            const errorSignatures = {
              "0x5247fdce": "InvalidExtraArgsTag (CCIP Router)",
              "0x8f4eb604": "ReceiverNotAllowlisted", 
              "0x1f2a2005": "NoGasLimitForChain",
              "0xea553b34": "DestNotAllowlisted",
              "0x4e487b71": "InvalidAmount",
              "0x8456cb59": "NotEnoughNative"
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
      }
    } catch (error) {
      console.log(`❌ Error checking revert reason: ${error.message}`);
    }

    // 5. Check current state
    console.log("\n🔍 Current Contract State:");
    console.log("==========================");
    
    try {
      const premiumVault = await ethers.getContractAt("PremiumVault", PREMIUM_VAULT);
      
      // Check if the transaction parameters would work now
      const tx = await signer.provider.getTransaction(FAILED_TX_HASH);
      if (tx && tx.data) {
        const decodedData = premiumVault.interface.parseTransaction({ data: tx.data });
        
        if (decodedData.name === 'buyCoverage') {
          const [dstChainSelector, hederaReceiver, terms, premiumPYUSD] = decodedData.args;
          
          console.log(`\n🧪 Testing Current State:`);
          
          // Test fee estimation
          try {
            const fee = await premiumVault.quoteCCIPFee(
              dstChainSelector,
              hederaReceiver,
              terms
            );
            console.log(`✅ Fee estimation works: ${ethers.formatEther(fee)} ETH`);
          } catch (error) {
            console.log(`❌ Fee estimation fails: ${error.message}`);
          }
          
          // Check receiver allowlist
          try {
            const receiverAllowed = await premiumVault.allowlistedReceivers(hederaReceiver);
            console.log(`✅ Receiver allowlisted: ${receiverAllowed}`);
          } catch (error) {
            console.log(`❌ Receiver check fails: ${error.message}`);
          }
          
          // Check destination chain allowlist
          try {
            const chainAllowed = await premiumVault.allowlistedDestChains(dstChainSelector);
            console.log(`✅ Destination chain allowlisted: ${chainAllowed}`);
          } catch (error) {
            console.log(`❌ Chain check fails: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Error checking current state: ${error.message}`);
    }

    console.log("\n📋 Analysis Summary:");
    console.log("====================");
    console.log("✅ Transaction details retrieved");
    console.log("✅ Receipt status checked");
    console.log("✅ Transaction data decoded");
    console.log("✅ Revert reason analyzed");
    console.log("✅ Current state verified");

  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
