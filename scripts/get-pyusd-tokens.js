const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Getting PYUSD Tokens for Testing...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // Contract addresses
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";

  try {
    console.log("📋 PYUSD Token Information:");
    console.log("============================");
    console.log(`PYUSD Token: ${PYUSD_TOKEN}`);
    console.log(`PremiumVault: ${PREMIUM_VAULT}`);

    const pyusdToken = await ethers.getContractAt("IERC20", PYUSD_TOKEN);

    // Check current balances
    console.log("\n💰 Current Balances:");
    console.log("====================");
    
    const pyusdBalance = await pyusdToken.balanceOf(signer.address);
    const ethBalance = await signer.provider.getBalance(signer.address);
    
    console.log(`PYUSD Balance: ${ethers.formatEther(pyusdBalance)} PYUSD`);
    console.log(`ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    // Check if we need PYUSD
    if (pyusdBalance > ethers.parseEther("0.1")) {
      console.log(`✅ You have sufficient PYUSD: ${ethers.formatEther(pyusdBalance)} PYUSD`);
      
      // Check allowance
      const allowance = await pyusdToken.allowance(signer.address, PREMIUM_VAULT);
      console.log(`PYUSD Allowance: ${ethers.formatEther(allowance)} PYUSD`);
      
      if (allowance < ethers.parseEther("1")) {
        console.log(`\n🔧 Approving PYUSD spending...`);
        const approveTx = await pyusdToken.approve(PREMIUM_VAULT, ethers.parseEther("100"));
        await approveTx.wait();
        console.log(`✅ PYUSD approved: ${approveTx.hash}`);
      } else {
        console.log(`✅ PYUSD already approved: ${ethers.formatEther(allowance)} PYUSD`);
      }
      
      return;
    }

    console.log(`\n❌ Insufficient PYUSD: ${ethers.formatEther(pyusdBalance)} PYUSD`);
    console.log(`💡 You need PYUSD tokens to test the coverage purchase`);

    // Try to get PYUSD from faucet or other sources
    console.log("\n🔍 PYUSD Sources:");
    console.log("=================");
    console.log("1. Check if there's a PYUSD faucet for Sepolia");
    console.log("2. Use a DEX to swap ETH for PYUSD");
    console.log("3. Bridge PYUSD from another network");
    console.log("4. Contact the PYUSD team for testnet tokens");

    // Check if we can interact with the token contract
    console.log("\n🔍 Token Contract Check:");
    console.log("=======================");
    
    try {
      const name = await pyusdToken.name();
      const symbol = await pyusdToken.symbol();
      const decimals = await pyusdToken.decimals();
      const totalSupply = await pyusdToken.totalSupply();
      
      console.log(`✅ Token Name: ${name}`);
      console.log(`✅ Token Symbol: ${symbol}`);
      console.log(`✅ Decimals: ${decimals}`);
      console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} PYUSD`);
      
    } catch (error) {
      console.log(`❌ Token contract check failed: ${error.message}`);
    }

    // Try to find PYUSD on Uniswap or other DEX
    console.log("\n🔍 DEX Information:");
    console.log("===================");
    console.log("You can try to swap ETH for PYUSD on:");
    console.log("- Uniswap V3 (Sepolia)");
    console.log("- 1inch (Sepolia)");
    console.log("- Other DEXes that support Sepolia");

    // Check if there are any PYUSD holders we can ask
    console.log("\n🔍 Alternative Solutions:");
    console.log("=========================");
    console.log("1. Ask the PYUSD team for testnet tokens");
    console.log("2. Check if there's a faucet in their documentation");
    console.log("3. Look for PYUSD on Sepolia DEXes");
    console.log("4. Bridge PYUSD from mainnet if available");

    // Create a simple approval script for when you get PYUSD
    console.log("\n📝 When you get PYUSD, run this script to approve spending:");
    console.log("==========================================================");
    console.log(`
const { ethers } = require("hardhat");

async function approvePYUSD() {
  const [signer] = await ethers.getSigners();
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const PREMIUM_VAULT = "0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499";
  
  const pyusdToken = await ethers.getContractAt("IERC20", PYUSD_TOKEN);
  
  console.log("Approving PYUSD spending...");
  const tx = await pyusdToken.approve(PREMIUM_VAULT, ethers.parseEther("100"));
  await tx.wait();
  console.log("PYUSD approved!");
}

approvePYUSD();
    `);

  } catch (error) {
    console.error("❌ Script failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
