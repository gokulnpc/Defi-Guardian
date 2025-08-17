import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address))
  );

  const network = await ethers.provider.getNetwork();
  console.log(
    "Network:",
    network.name,
    "Chain ID:",
    network.chainId.toString()
  );

  // Deploy Mock Contracts (for testing networks)
  let pyusdAddress, mockRouterAddress;

  if (network.chainId === 1337n || network.chainId === 31337n) {
    // Local network - deploy mocks
    console.log("\n=== Deploying Mock Contracts ===");

    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const mockPYUSD = await MockPYUSD.deploy();
    await mockPYUSD.waitForDeployment();
    pyusdAddress = await mockPYUSD.getAddress();
    console.log("MockPYUSD deployed to:", pyusdAddress);

    const MockCCIPRouter = await ethers.getContractFactory("MockCCIPRouter");
    const mockRouter = await MockCCIPRouter.deploy();
    await mockRouter.waitForDeployment();
    mockRouterAddress = await mockRouter.getAddress();
    console.log("MockCCIPRouter deployed to:", mockRouterAddress);

    // Mint some PYUSD for testing
    await mockPYUSD.mint(deployer.address, ethers.parseUnits("1000000", 6));
    console.log("Minted 1M PYUSD for deployer");
  } else {
    // Use real addresses for testnets
    if (network.chainId === 11155111n) {
      // Sepolia
      pyusdAddress = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // Sepolia PYUSD
      mockRouterAddress = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"; // Sepolia CCIP Router
    } else if (network.chainId === 296n) {
      // Hedera Testnet
      pyusdAddress = "0x0000000000000000000000000000000000000001"; // Placeholder
      mockRouterAddress = "0x0000000000000000000000000000000000000002"; // Placeholder
    } else {
      throw new Error(`Unsupported network: ${network.chainId}`);
    }
    console.log("Using existing PYUSD at:", pyusdAddress);
    console.log("Using existing CCIP Router at:", mockRouterAddress);
  }

  // Deploy contracts based on network
  if (
    network.chainId === 11155111n ||
    network.chainId === 1337n ||
    network.chainId === 31337n
  ) {
    // Sepolia or local network - deploy Sepolia contracts
    console.log("\n=== Deploying Sepolia Contracts ===");

    const LPVault = await ethers.getContractFactory("LPVault");
    const lpVault = await LPVault.deploy(
      pyusdAddress,
      mockRouterAddress,
      deployer.address
    );
    await lpVault.waitForDeployment();
    console.log("LPVault deployed to:", await lpVault.getAddress());

    const PayoutVault = await ethers.getContractFactory("PayoutVault");
    const payoutVault = await PayoutVault.deploy(
      mockRouterAddress,
      pyusdAddress,
      deployer.address
    );
    await payoutVault.waitForDeployment();
    console.log("PayoutVault deployed to:", await payoutVault.getAddress());

    const PremiumVault = await ethers.getContractFactory("PremiumVault");
    const premiumVault = await PremiumVault.deploy(
      mockRouterAddress,
      pyusdAddress,
      await lpVault.getAddress(),
      await payoutVault.getAddress(),
      deployer.address
    );
    await premiumVault.waitForDeployment();
    console.log("PremiumVault deployed to:", await premiumVault.getAddress());

    // Basic configuration for testing
    if (network.chainId === 1337n || network.chainId === 31337n) {
      console.log("\n=== Configuring Sepolia Contracts ===");

      // Configure PremiumVault
      await premiumVault.allowlistDestChain(1, true); // Hedera
      await premiumVault.allowlistReceiver(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address"],
          ["0x0000000000000000000000000000000000000123"]
        ),
        true
      );
      await premiumVault.setGasLimit(1, 500000);
      console.log("PremiumVault configured");

      // Configure LPVault
      await lpVault.setReceiver(
        1,
        "0x0000000000000000000000000000000000000123"
      );
      await lpVault.setGasLimit(1, 300000);
      console.log("LPVault configured");
    }
  }

  if (
    network.chainId === 296n ||
    network.chainId === 1337n ||
    network.chainId === 31337n
  ) {
    // Hedera or local network - deploy Hedera contracts
    console.log("\n=== Deploying Hedera Contracts ===");

    const PolicyManager = await ethers.getContractFactory("PolicyManager");
    const policyManager = await PolicyManager.deploy(
      mockRouterAddress,
      deployer.address
    );
    await policyManager.waitForDeployment();
    console.log("PolicyManager deployed to:", await policyManager.getAddress());

    const VotingMirror = await ethers.getContractFactory("VotingMirror");
    const votingMirror = await VotingMirror.deploy(
      mockRouterAddress,
      deployer.address
    );
    await votingMirror.waitForDeployment();
    console.log("VotingMirror deployed to:", await votingMirror.getAddress());

    const ClaimManager = await ethers.getContractFactory("ClaimManager");
    const claimManager = await ClaimManager.deploy(
      mockRouterAddress,
      await votingMirror.getAddress(),
      await policyManager.getAddress(),
      deployer.address
    );
    await claimManager.waitForDeployment();
    console.log("ClaimManager deployed to:", await claimManager.getAddress());

    // Basic configuration for testing
    if (network.chainId === 1337n || network.chainId === 31337n) {
      console.log("\n=== Configuring Hedera Contracts ===");

      // Configure PolicyManager
      await policyManager.allowlistSourceChain(2, true); // Sepolia
      await policyManager.allowlistSender(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address"],
          ["0x0000000000000000000000000000000000000456"]
        ),
        true
      );
      console.log("PolicyManager configured");

      // Configure VotingMirror
      await votingMirror.allowlistSourceChain(2, true); // Sepolia
      await votingMirror.allowlistSender(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address"],
          ["0x0000000000000000000000000000000000000789"]
        ),
        true
      );
      console.log("VotingMirror configured");

      // Configure ClaimManager
      await claimManager.allowlistDestChain(2, true); // Sepolia
      await claimManager.allowlistReceiver(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address"],
          ["0x0000000000000000000000000000000000000abc"]
        ),
        true
      );
      await claimManager.setGasLimit(2, 400000);
      await claimManager.setParams(7 * 24 * 60 * 60, 5000); // 7 days, 50% quorum
      console.log("ClaimManager configured");
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Gas used: Check transaction receipts for details");
  console.log("\nDeployment completed successfully! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
