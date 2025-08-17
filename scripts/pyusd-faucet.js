const { ethers } = require("hardhat");

async function main() {
  console.log("🚰 PYUSD Faucet...\n");

  const [signer] = await ethers.getSigners();
  console.log("👤 Using signer:", signer.address);

  // PYUSD token address
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const AMOUNT_TO_MINT = ethers.parseEther("1000"); // 1000 PYUSD

  try {
    console.log("📋 Configuration:");
    console.log("==================");
    console.log(`PYUSD Token: ${PYUSD_TOKEN}`);
    console.log(`Amount to mint: ${ethers.formatEther(AMOUNT_TO_MINT)} PYUSD`);
    console.log(`Recipient: ${signer.address}`);

    // PYUSD ABI (minimal for minting)
    const PYUSD_ABI = [
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    const pyusdContract = new ethers.Contract(PYUSD_TOKEN, PYUSD_ABI, signer);

    // Check current balance
    const currentBalance = await pyusdContract.balanceOf(signer.address);
    console.log(`\n💰 Current PYUSD balance: ${ethers.formatEther(currentBalance)}`);

    // Check if signer is owner (can mint)
    const owner = await pyusdContract.owner();
    console.log(`👑 PYUSD owner: ${owner}`);
    console.log(`   Signer is owner: ${owner.toLowerCase() === signer.address.toLowerCase()}`);

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("\n❌ You are not the owner of PYUSD token. Cannot mint.");
      console.log("💡 Try using the owner account or contact the PYUSD owner for tokens.");
      return;
    }

    // Mint PYUSD
    console.log("\n✅ Minting PYUSD...");
    const tx = await pyusdContract.mint(signer.address, AMOUNT_TO_MINT);
    await tx.wait();
    console.log(`✅ PYUSD minted! Transaction: ${tx.hash}`);

    // Check new balance
    const newBalance = await pyusdContract.balanceOf(signer.address);
    console.log(`\n💰 New PYUSD balance: ${ethers.formatEther(newBalance)}`);

    console.log("\n🎉 PYUSD Faucet Complete!");

  } catch (error) {
    console.error("❌ PYUSD faucet failed:", error);
    
    if (error.message.includes("owner")) {
      console.log("\n💡 If you're not the PYUSD owner, you can:");
      console.log("1. Use the owner account to mint tokens");
      console.log("2. Transfer tokens from another account");
      console.log("3. Use a different PYUSD token with minting capability");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
