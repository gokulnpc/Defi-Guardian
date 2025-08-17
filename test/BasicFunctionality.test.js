import { expect } from "chai";
import { ethers } from "hardhat";

describe("🔧 DeFi Guardian - Basic Functionality Tests", function () {
  let owner, alice, bob, charlie;
  let pyusd, mockRouter;
  let lpVault, payoutVault, premiumVault;
  let policyManager, votingMirror, claimManager;

  // Test constants initialized in before hook
  let PREMIUM_AMOUNT, COVERAGE_AMOUNT, LP_DEPOSIT, CLAIM_AMOUNT;
  const HEDERA_CHAIN_SELECTOR = 1n;
  const SEPOLIA_CHAIN_SELECTOR = 2n;

  before(async function () {
    // Initialize test constants
    PREMIUM_AMOUNT = ethers.parseUnits("1000", 6);
    COVERAGE_AMOUNT = ethers.parseUnits("50000", 6);
    LP_DEPOSIT = ethers.parseUnits("10000", 6);
    CLAIM_AMOUNT = ethers.parseUnits("25000", 6);

    // Get signers
    [owner, alice, bob, charlie] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy fresh contracts for each test
    await deployAllContracts();
    await setupBasicConfiguration();
    await fundTestAccounts();
  });

  async function deployAllContracts() {
    // Deploy mock contracts
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    pyusd = await MockPYUSD.deploy();
    await pyusd.waitForDeployment();

    const MockCCIPRouter = await ethers.getContractFactory("MockCCIPRouter");
    mockRouter = await MockCCIPRouter.deploy();
    await mockRouter.waitForDeployment();

    // Deploy Sepolia contracts (LPVault, PayoutVault, PremiumVault)
    const LPVault = await ethers.getContractFactory("LPVault");
    lpVault = await LPVault.deploy(
      await pyusd.getAddress(),
      await mockRouter.getAddress(),
      await owner.getAddress()
    );
    await lpVault.waitForDeployment();

    const PayoutVault = await ethers.getContractFactory("PayoutVault");
    payoutVault = await PayoutVault.deploy(
      await mockRouter.getAddress(),
      await pyusd.getAddress(),
      await owner.getAddress()
    );
    await payoutVault.waitForDeployment();

    const PremiumVault = await ethers.getContractFactory("PremiumVault");
    premiumVault = await PremiumVault.deploy(
      await mockRouter.getAddress(),
      await pyusd.getAddress(),
      await lpVault.getAddress(),
      await payoutVault.getAddress(),
      await owner.getAddress()
    );
    await premiumVault.waitForDeployment();

    // Deploy Hedera contracts (PolicyManager, VotingMirror, ClaimManager)
    const PolicyManager = await ethers.getContractFactory("PolicyManager");
    policyManager = await PolicyManager.deploy(
      await mockRouter.getAddress(),
      await owner.getAddress()
    );
    await policyManager.waitForDeployment();

    const VotingMirror = await ethers.getContractFactory("VotingMirror");
    votingMirror = await VotingMirror.deploy(
      await mockRouter.getAddress(),
      await owner.getAddress()
    );
    await votingMirror.waitForDeployment();

    const ClaimManager = await ethers.getContractFactory("ClaimManager");
    claimManager = await ClaimManager.deploy(
      await mockRouter.getAddress(),
      await votingMirror.getAddress(),
      await policyManager.getAddress(),
      await owner.getAddress()
    );
    await claimManager.waitForDeployment();
  }

  async function setupBasicConfiguration() {
    // Configure PremiumVault
    await premiumVault.allowlistDestChain(HEDERA_CHAIN_SELECTOR, true);
    await premiumVault.allowlistReceiver(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      ),
      true
    );
    await premiumVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 500000);

    // Configure VotingMirror
    await votingMirror.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
  }

  async function fundTestAccounts() {
    // Fund all test accounts with PYUSD
    const accounts = [alice, bob, charlie, owner];
    for (const account of accounts) {
      await pyusd.mint(
        await account.getAddress(),
        ethers.parseUnits("1000000", 6)
      );
    }
  }

  describe("🏦 LPVault Basic Tests", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await lpVault.pyusdToken()).to.equal(await pyusd.getAddress());
      expect(await lpVault.totalShares()).to.equal(0);
      expect(await lpVault.totalAssets()).to.equal(0);
    });

    it("Should allow LP deposits and mint shares", async function () {
      // Bob deposits PYUSD
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);

      // Check shares were minted
      const stakes = await lpVault.stakes(await bob.getAddress());
      const shares = stakes[0];
      expect(shares).to.be.gt(0, "Bob should have shares");
      expect(await lpVault.totalShares()).to.equal(shares);

      // Check PYUSD was transferred
      expect(await pyusd.balanceOf(await lpVault.getAddress())).to.equal(
        LP_DEPOSIT
      );
    });

    it("Should handle withdrawal requests with cooldown", async function () {
      // Bob deposits first
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);

      const stakes = await lpVault.stakes(await bob.getAddress());
      const shares = stakes[0];

      // Request withdrawal
      await lpVault.connect(bob).requestWithdraw(shares);

      // Check withdrawal request was recorded
      const withdrawRequest = await lpVault.withdrawRequests(
        await bob.getAddress()
      );
      expect(withdrawRequest[0]).to.equal(shares);
      expect(withdrawRequest[1]).to.be.gt(0); // lockedUntil should be set
    });

    it("Should reject zero amount deposits", async function () {
      await expect(
        lpVault.connect(bob).deposit(0)
      ).to.be.revertedWithCustomError(lpVault, "ZeroAmount");
    });
  });

  describe("💰 PayoutVault Basic Tests", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await payoutVault.pyusdToken()).to.equal(await pyusd.getAddress());
    });

    it("Should allow PYUSD deposits from owner", async function () {
      const depositAmount = ethers.parseUnits("10000", 6);

      await pyusd
        .connect(owner)
        .approve(await payoutVault.getAddress(), depositAmount);
      await payoutVault.connect(owner).depositPYUSD(depositAmount);

      expect(await pyusd.balanceOf(await payoutVault.getAddress())).to.equal(
        depositAmount
      );
    });

    it("Should allow ETH deposits", async function () {
      const ethAmount = ethers.parseEther("1");

      await owner.sendTransaction({
        to: await payoutVault.getAddress(),
        value: ethAmount,
      });

      expect(
        await ethers.provider.getBalance(await payoutVault.getAddress())
      ).to.equal(ethAmount);
    });
  });

  describe("🛡️ PremiumVault Basic Tests", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await premiumVault.pyusdToken()).to.equal(
        await pyusd.getAddress()
      );
      expect(await premiumVault.lpVault()).to.equal(await lpVault.getAddress());
      expect(await premiumVault.payoutVault()).to.equal(
        await payoutVault.getAddress()
      );
    });

    it("Should calculate premium allocation correctly", async function () {
      // Default split should be 70% to LP, 30% to payout
      const allocation = await premiumVault.previewAllocation(PREMIUM_AMOUNT);
      const toLP = allocation[0];
      const toReserve = allocation[1];

      expect(toLP).to.equal(ethers.parseUnits("700", 6)); // 70%
      expect(toReserve).to.equal(ethers.parseUnits("300", 6)); // 30%
    });

    it("Should allow owner to configure premium splits", async function () {
      // Change to 80% LP, 20% reserve
      await premiumVault.setSplit(8000, 2000);

      const allocation = await premiumVault.previewAllocation(PREMIUM_AMOUNT);
      const toLP = allocation[0];
      const toReserve = allocation[1];

      expect(toLP).to.equal(ethers.parseUnits("800", 6)); // 80%
      expect(toReserve).to.equal(ethers.parseUnits("200", 6)); // 20%
    });

    it("Should quote CCIP fees", async function () {
      const policyTerms = {
        poolId: ethers.keccak256(ethers.toUtf8Bytes("test-pool")),
        buyer: await alice.getAddress(),
        coverageAmount: COVERAGE_AMOUNT,
        startTs: BigInt(Math.floor(Date.now() / 1000)) + 100n,
        endTs: BigInt(Math.floor(Date.now() / 1000)) + 86400n * 30n,
        policyRef: ethers.keccak256(ethers.toUtf8Bytes("test-policy")),
      };

      const receiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      );

      const fee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        receiver,
        policyTerms
      );

      expect(fee).to.be.gt(0, "CCIP fee should be greater than 0");
    });
  });

  describe("📋 PolicyManager Basic Tests", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await policyManager.owner()).to.equal(await owner.getAddress());
    });

    it("Should allow owner to configure cross-chain settings", async function () {
      // Test source chain allowlisting
      await policyManager.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
      expect(
        await policyManager.allowlistedSourceChains(SEPOLIA_CHAIN_SELECTOR)
      ).to.be.true;

      // Test sender allowlisting
      const testSender = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await premiumVault.getAddress()]
      );
      await policyManager.allowlistSender(testSender, true);
      expect(await policyManager.allowlistedSenders(testSender)).to.be.true;
    });
  });

  describe("🗳️ VotingMirror Basic Tests", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await votingMirror.owner()).to.equal(await owner.getAddress());
    });

    it("Should allow authorized users to set voting power", async function () {
      // First allowlist the owner as a sender
      const ownerSender = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await owner.getAddress()]
      );
      await votingMirror.allowlistSender(ownerSender, true);

      // Set voting power for Bob
      const votingPower = ethers.parseEther("1000");
      await votingMirror.setPower(await bob.getAddress(), votingPower);

      expect(await votingMirror.vPowerOf(await bob.getAddress())).to.equal(
        votingPower
      );
    });

    it("Should track total voting power", async function () {
      // Allowlist owner as sender
      const ownerSender = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await owner.getAddress()]
      );
      await votingMirror.allowlistSender(ownerSender, true);

      // Set voting power for multiple users
      await votingMirror.setPower(
        await bob.getAddress(),
        ethers.parseEther("1000")
      );
      await votingMirror.setPower(
        await charlie.getAddress(),
        ethers.parseEther("500")
      );

      expect(await votingMirror.totalVotingPower()).to.equal(
        ethers.parseEther("1500")
      );
    });
  });

  describe("⚖️ ClaimManager Basic Tests", function () {
    beforeEach(async function () {
      // Setup voting power for tests
      const ownerSender = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await owner.getAddress()]
      );
      await votingMirror.allowlistSender(ownerSender, true);
      await votingMirror.setPower(
        await bob.getAddress(),
        ethers.parseEther("1000")
      );
      await votingMirror.setPower(
        await charlie.getAddress(),
        ethers.parseEther("500")
      );

      // Configure ClaimManager
      await claimManager.allowlistDestChain(SEPOLIA_CHAIN_SELECTOR, true);
      await claimManager.setParams(
        7 * 24 * 60 * 60, // 7 days voting period
        5000 // 50% quorum
      );
    });

    it("Should deploy with correct initial state", async function () {
      expect(await claimManager.owner()).to.equal(await owner.getAddress());
      expect(await claimManager.votingMirror()).to.equal(
        await votingMirror.getAddress()
      );
      expect(await claimManager.policyManager()).to.equal(
        await policyManager.getAddress()
      );
    });

    it("Should allow users to open claims", async function () {
      const policyId = ethers.keccak256(ethers.toUtf8Bytes("test-policy"));
      const dstReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      );

      const tx = await claimManager
        .connect(alice)
        .openClaim(
          policyId,
          await alice.getAddress(),
          CLAIM_AMOUNT,
          SEPOLIA_CHAIN_SELECTOR,
          dstReceiver
        );

      await expect(tx).to.emit(claimManager, "ClaimOpened");

      // Check claim was stored
      const claim = await claimManager.claims(0);
      expect(claim.claimant).to.equal(await alice.getAddress());
      expect(claim.amount).to.equal(CLAIM_AMOUNT);
    });

    it("Should allow voting on claims", async function () {
      // Open a claim first
      const policyId = ethers.keccak256(ethers.toUtf8Bytes("voting-test"));
      const dstReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      );

      await claimManager
        .connect(alice)
        .openClaim(
          policyId,
          await alice.getAddress(),
          CLAIM_AMOUNT,
          SEPOLIA_CHAIN_SELECTOR,
          dstReceiver
        );

      const claimId = 0n;

      // Bob votes yes
      await claimManager.connect(bob).voteYes(claimId);

      // Check vote was recorded
      const claim = await claimManager.claims(claimId);
      expect(claim.yesVotes).to.be.gt(0);
    });
  });

  describe("🔗 Cross-Chain Configuration Tests", function () {
    it("Should enforce access control on configuration functions", async function () {
      // Non-owner should not be able to configure
      await expect(
        premiumVault
          .connect(alice)
          .allowlistDestChain(HEDERA_CHAIN_SELECTOR, true)
      ).to.be.reverted;

      await expect(
        votingMirror
          .connect(alice)
          .allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true)
      ).to.be.reverted;

      await expect(claimManager.connect(alice).setParams(86400, 5000)).to.be
        .reverted;
    });

    it("Should validate configuration parameters", async function () {
      // Test invalid chain selector (0)
      await expect(premiumVault.allowlistDestChain(0, true)).to.be.reverted;

      // Test invalid quorum (> 10000 = 100%)
      await expect(claimManager.setParams(86400, 15000)).to.be.reverted;
    });
  });

  describe("💎 Integration Readiness Tests", function () {
    it("Should have all contracts properly connected", async function () {
      // Verify PremiumVault knows about LP and Payout vaults
      expect(await premiumVault.lpVault()).to.equal(await lpVault.getAddress());
      expect(await premiumVault.payoutVault()).to.equal(
        await payoutVault.getAddress()
      );

      // Verify ClaimManager knows about VotingMirror and PolicyManager
      expect(await claimManager.votingMirror()).to.equal(
        await votingMirror.getAddress()
      );
      expect(await claimManager.policyManager()).to.equal(
        await policyManager.getAddress()
      );

      // Verify all contracts use the same CCIP router
      expect(await lpVault.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
      expect(await premiumVault.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
      expect(await payoutVault.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
      expect(await policyManager.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
      expect(await votingMirror.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
      expect(await claimManager.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
    });

    it("Should handle basic token operations", async function () {
      // Test PYUSD minting and balances
      const mintAmount = ethers.parseUnits("1000", 6);
      await pyusd.mint(await alice.getAddress(), mintAmount);
      expect(await pyusd.balanceOf(await alice.getAddress())).to.be.gte(
        mintAmount
      );

      // Test PYUSD transfers
      await pyusd
        .connect(alice)
        .transfer(await bob.getAddress(), ethers.parseUnits("100", 6));
      expect(await pyusd.balanceOf(await bob.getAddress())).to.be.gte(
        ethers.parseUnits("100", 6)
      );

      // Test PYUSD approvals
      await pyusd
        .connect(alice)
        .approve(await lpVault.getAddress(), ethers.parseUnits("500", 6));
      expect(
        await pyusd.allowance(
          await alice.getAddress(),
          await lpVault.getAddress()
        )
      ).to.equal(ethers.parseUnits("500", 6));
    });
  });
});
