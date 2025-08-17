const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking CCIP Status...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";
  const CCIP_ROUTER = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59";
  const POLICY_MANAGER = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";
  const HEDERA_CHAIN_SELECTOR = BigInt("222782988166878823");

  try {
    console.log("📋 Configuration:");
    console.log("==================");
    console.log(`PremiumVault: ${PREMIUM_VAULT}`);
    console.log(`CCIP Router: ${CCIP_ROUTER}`);
    console.log(`PolicyManager: ${POLICY_MANAGER}`);
    console.log(`Hedera Chain Selector: ${HEDERA_CHAIN_SELECTOR}`);

    // Get PremiumVault contract
    const PremiumVault = await ethers.getContractFactory("PremiumVault");
    const premiumVault = PremiumVault.attach(PREMIUM_VAULT);

    // Check router address
    const routerAddress = await premiumVault.router();
    console.log(`\n🔗 Router address: ${routerAddress}`);
    console.log(`   Expected: ${CCIP_ROUTER}`);
    console.log(`   Match: ${routerAddress.toLowerCase() === CCIP_ROUTER.toLowerCase()}`);

    // Check PYUSD address
    const pyusdAddress = await premiumVault.PYUSD();
    console.log(`\n💰 PYUSD address: ${pyusdAddress}`);
    console.log(`   Expected: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`);
    console.log(`   Match: ${pyusdAddress.toLowerCase() === "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9".toLowerCase()}`);

    // Check vault addresses
    const lpVaultAddress = await premiumVault.lpVault();
    const payoutVaultAddress = await premiumVault.payoutVault();
    console.log(`\n🏦 Vault addresses:`);
    console.log(`   LP Vault: ${lpVaultAddress}`);
    console.log(`   Payout Vault: ${payoutVaultAddress}`);

    // Check allowlist status
    const policyManagerReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [POLICY_MANAGER]
    );
    
    const isReceiverAllowlisted = await premiumVault.allowlistedReceivers(policyManagerReceiver);
    const isChainAllowlisted = await premiumVault.allowlistedDestChains(HEDERA_CHAIN_SELECTOR);
    const gasLimit = await premiumVault.gasLimitByChain(HEDERA_CHAIN_SELECTOR);

    console.log(`\n📋 Allowlist Status:`);
    console.log(`   PolicyManager receiver allowlisted: ${isReceiverAllowlisted}`);
    console.log(`   Hedera chain allowlisted: ${isChainAllowlisted}`);
    console.log(`   Gas limit: ${gasLimit}`);

    // Check premium split
    const premiumBpsToLP = await premiumVault.premiumBpsToLP();
    const premiumBpsToReserve = await premiumVault.premiumBpsToReserve();
    console.log(`\n💰 Premium Split:`);
    console.log(`   LP: ${premiumBpsToLP} bps (${Number(premiumBpsToLP) / 100}%)`);
    console.log(`   Reserve: ${premiumBpsToReserve} bps (${Number(premiumBpsToReserve) / 100}%)`);

    // Test a simple CCIP fee quote
    console.log(`\n🧪 Testing CCIP Fee Quote...`);
    try {
      const testPolicyTerms = {
        poolId: "0x0000000000000000000000000000000000000000000000000000000000000001",
        buyer: signer.address,
        coverageAmount: ethers.parseEther("1"),
        startTs: BigInt(Math.floor(Date.now() / 1000)),
        endTs: BigInt(Math.floor(Date.now() / 1000) + 86400), // 1 day
        policyRef: "0x0000000000000000000000000000000000000000000000000000000000000001",
      };

      const feeQuote = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        policyManagerReceiver,
        testPolicyTerms
      );

      console.log(`✅ CCIP Fee Quote successful: ${ethers.formatEther(feeQuote)} ETH`);
    } catch (feeError) {
      console.error(`❌ CCIP Fee Quote failed:`, feeError.message);
    }

    // Check signer's PYUSD balance
    const PYUSD_ABI = [
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    const pyusdContract = new ethers.Contract("0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9", PYUSD_ABI, signer);
    const pyusdBalance = await pyusdContract.balanceOf(signer.address);
    const ethBalance = await ethers.provider.getBalance(signer.address);

    console.log(`\n💰 Signer Balances:`);
    console.log(`   PYUSD: ${ethers.formatUnits(pyusdBalance, 6)} (raw: ${pyusdBalance})`);
    console.log(`   ETH: ${ethers.formatEther(ethBalance)}`);

    console.log(`\n🎉 CCIP Status Check Complete!`);

  } catch (error) {
    console.error("❌ CCIP status check failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
