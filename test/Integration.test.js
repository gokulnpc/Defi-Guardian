import { expect } from "chai";
import { ethers } from "hardhat";

describe("🌉 DeFi Guardian - Integration Tests", function () {
  let owner, alice, bob, charlie;
  let pyusd, mockRouter;
  let lpVault, payoutVault, premiumVault;
  let policyManager, votingMirror, claimManager;

  // Test constants
  let PREMIUM_AMOUNT, COVERAGE_AMOUNT, LP_DEPOSIT, CLAIM_AMOUNT;
  const HEDERA_CHAIN_SELECTOR = 1n;
  const SEPOLIA_CHAIN_SELECTOR = 2n;

  before(async function () {
    PREMIUM_AMOUNT = ethers.parseUnits("1000", 6);
    COVERAGE_AMOUNT = ethers.parseUnits("50000", 6);
    LP_DEPOSIT = ethers.parseUnits("100000", 6);
    CLAIM_AMOUNT = ethers.parseUnits("25000", 6);

    [owner, alice, bob, charlie] = await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployAndConfigureSystem();
  });

  async function deployAndConfigureSystem() {
    // Deploy all contracts
    await deployAllContracts();

    // Complete system configuration
    await configureAllCrossChainSettings();

    // Fund accounts and contracts
    await fundTestAccounts();
    await fundContractsForCCIP();
  }

  async function deployAllContracts() {
    // Mock contracts
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    pyusd = await MockPYUSD.deploy();
    await pyusd.waitForDeployment();

    const MockCCIPRouter = await ethers.getContractFactory("MockCCIPRouter");
    mockRouter = await MockCCIPRouter.deploy();
    await mockRouter.waitForDeployment();

    // Sepolia contracts
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

    // Hedera contracts
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

  async function configureAllCrossChainSettings() {
    // Configure PremiumVault -> PolicyManager (Sepolia -> Hedera)
    await premiumVault.allowlistDestChain(HEDERA_CHAIN_SELECTOR, true);
    await premiumVault.allowlistReceiver(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      ),
      true
    );
    await premiumVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 500000);

    // Configure LPVault -> VotingMirror (Sepolia -> Hedera)
    await lpVault.setReceiver(
      HEDERA_CHAIN_SELECTOR,
      await votingMirror.getAddress()
    );
    await lpVault.setGasLimit(HEDERA_CHAIN_SELECTOR, 300000);

    // Configure PolicyManager (receives from Sepolia)
    await policyManager.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
    await policyManager.allowlistSender(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await premiumVault.getAddress()]
      ),
      true
    );

    // Configure VotingMirror (receives from Sepolia)
    await votingMirror.allowlistSourceChain(SEPOLIA_CHAIN_SELECTOR, true);
    await votingMirror.allowlistSender(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await lpVault.getAddress()]
      ),
      true
    );

    // Configure ClaimManager -> PayoutVault (Hedera -> Sepolia)
    await claimManager.allowlistDestChain(SEPOLIA_CHAIN_SELECTOR, true);
    await claimManager.allowlistReceiver(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      ),
      true
    );
    await claimManager.setGasLimit(SEPOLIA_CHAIN_SELECTOR, 400000);

    // Set ClaimManager voting parameters
    await claimManager.setParams(
      7 * 24 * 60 * 60, // 7 days voting period
      5000 // 50% quorum
    );

    // Allow owner to set initial voting power
    await votingMirror.allowlistSender(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await owner.getAddress()]
      ),
      true
    );
  }

  async function fundTestAccounts() {
    const accounts = [alice, bob, charlie, owner];
    for (const account of accounts) {
      await pyusd.mint(
        await account.getAddress(),
        ethers.parseUnits("1000000", 6)
      );
    }
  }

  async function fundContractsForCCIP() {
    // Fund contracts with ETH for CCIP fees
    const contracts = [lpVault, premiumVault, claimManager];
    for (const contract of contracts) {
      await owner.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("10"),
      });
    }

    // Fund payout vault with PYUSD for claims
    await pyusd
      .connect(owner)
      .approve(await payoutVault.getAddress(), ethers.parseUnits("500000", 6));
    await payoutVault
      .connect(owner)
      .depositPYUSD(ethers.parseUnits("500000", 6));
  }

  describe("🔄 Complete Coverage Purchase Flow", function () {
    it("Should execute full coverage purchase with premium allocation", async function () {
      // Step 1: Bob becomes an LP to provide liquidity
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);

      const lpSharesBefore = await lpVault.stakes(await bob.getAddress());
      expect(lpSharesBefore[0]).to.be.gt(0, "Bob should have LP shares");

      // Step 2: Alice purchases coverage
      await pyusd
        .connect(alice)
        .approve(await premiumVault.getAddress(), PREMIUM_AMOUNT);

      const policyTerms = {
        poolId: ethers.keccak256(ethers.toUtf8Bytes("integration-pool")),
        buyer: await alice.getAddress(),
        coverageAmount: COVERAGE_AMOUNT,
        startTs: BigInt(Math.floor(Date.now() / 1000)) + 100n,
        endTs: BigInt(Math.floor(Date.now() / 1000)) + 86400n * 30n,
        policyRef: ethers.keccak256(ethers.toUtf8Bytes("integration-policy")),
      };

      const hederaReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      );

      // Get CCIP fee and execute purchase
      const ccipFee = await premiumVault.quoteCCIPFee(
        HEDERA_CHAIN_SELECTOR,
        hederaReceiver,
        policyTerms
      );

      const tx = await premiumVault
        .connect(alice)
        .buyCoverage(
          HEDERA_CHAIN_SELECTOR,
          hederaReceiver,
          policyTerms,
          PREMIUM_AMOUNT,
          { value: ccipFee }
        );

      await expect(tx).to.emit(premiumVault, "PremiumAllocated");

      // Step 3: Verify premium allocation
      const lpVaultBalance = await pyusd.balanceOf(await lpVault.getAddress());
      const payoutVaultBalance = await pyusd.balanceOf(
        await payoutVault.getAddress()
      );

      // LP vault should receive original deposit + 70% of premium
      const expectedLPBalance = LP_DEPOSIT + (PREMIUM_AMOUNT * 7000n) / 10000n;
      expect(lpVaultBalance).to.equal(expectedLPBalance);

      // Payout vault should receive initial funding + 30% of premium
      const expectedPayoutIncrease = (PREMIUM_AMOUNT * 3000n) / 10000n;
      expect(payoutVaultBalance).to.be.gte(
        ethers.parseUnits("500000", 6) + expectedPayoutIncrease
      );
    });

    it("Should handle multiple coverage purchases correctly", async function () {
      // Setup LP
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);

      const initialLPBalance = await pyusd.balanceOf(
        await lpVault.getAddress()
      );
      const initialPayoutBalance = await pyusd.balanceOf(
        await payoutVault.getAddress()
      );

      // Multiple users buy coverage
      const users = [alice, charlie];
      const policyCount = users.length;

      for (let i = 0; i < users.length; i++) {
        await pyusd
          .connect(users[i])
          .approve(await premiumVault.getAddress(), PREMIUM_AMOUNT);

        const policyTerms = {
          poolId: ethers.keccak256(ethers.toUtf8Bytes(`multi-pool-${i}`)),
          buyer: await users[i].getAddress(),
          coverageAmount: COVERAGE_AMOUNT,
          startTs: BigInt(Math.floor(Date.now() / 1000)) + 100n,
          endTs: BigInt(Math.floor(Date.now() / 1000)) + 86400n * 30n,
          policyRef: ethers.keccak256(ethers.toUtf8Bytes(`multi-policy-${i}`)),
        };

        const hederaReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
          ["address"],
          [await policyManager.getAddress()]
        );

        await premiumVault
          .connect(users[i])
          .buyCoverage(
            HEDERA_CHAIN_SELECTOR,
            hederaReceiver,
            policyTerms,
            PREMIUM_AMOUNT,
            { value: ethers.parseEther("0.1") }
          );
      }

      // Verify cumulative premium allocation
      const finalLPBalance = await pyusd.balanceOf(await lpVault.getAddress());
      const finalPayoutBalance = await pyusd.balanceOf(
        await payoutVault.getAddress()
      );

      const totalPremiumToLP =
        (PREMIUM_AMOUNT * 7000n * BigInt(policyCount)) / 10000n;
      const totalPremiumToPayout =
        (PREMIUM_AMOUNT * 3000n * BigInt(policyCount)) / 10000n;

      expect(finalLPBalance).to.equal(initialLPBalance + totalPremiumToLP);
      expect(finalPayoutBalance).to.equal(
        initialPayoutBalance + totalPremiumToPayout
      );
    });
  });

  describe("🗳️ Complete Claims and Voting Flow", function () {
    beforeEach(async function () {
      // Setup voting power from LP stakes
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);

      await pyusd
        .connect(charlie)
        .approve(await lpVault.getAddress(), LP_DEPOSIT / 2n);
      await lpVault.connect(charlie).deposit(LP_DEPOSIT / 2n);

      // Simulate voting power sync (normally done via CCIP)
      const bobShares = await lpVault.stakes(await bob.getAddress());
      const charlieShares = await lpVault.stakes(await charlie.getAddress());

      await votingMirror.setPower(await bob.getAddress(), bobShares[0]);
      await votingMirror.setPower(await charlie.getAddress(), charlieShares[0]);
    });

    it("Should execute complete claim approval flow", async function () {
      const policyId = ethers.keccak256(
        ethers.toUtf8Bytes("approved-claim-policy")
      );
      const dstPayoutVault = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      );

      // Step 1: Alice opens a claim
      const openTx = await claimManager
        .connect(alice)
        .openClaim(
          policyId,
          await alice.getAddress(),
          CLAIM_AMOUNT,
          SEPOLIA_CHAIN_SELECTOR,
          dstPayoutVault
        );

      await expect(openTx).to.emit(claimManager, "ClaimOpened");
      const claimId = 0n;

      // Step 2: Voting phase - both voters approve
      await claimManager.connect(bob).voteYes(claimId);
      await claimManager.connect(charlie).voteYes(claimId);

      // Verify votes were recorded
      const claimAfterVoting = await claimManager.claims(claimId);
      expect(claimAfterVoting.yesVotes).to.be.gt(0);
      expect(claimAfterVoting.noVotes).to.equal(0);

      // Step 3: Fast forward past voting period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      // Step 4: Finalize claim
      const finalizeTx = await claimManager
        .connect(alice)
        .finalizeClaim(claimId, {
          value: ethers.parseEther("0.1"),
        });

      await expect(finalizeTx).to.emit(claimManager, "ClaimFinalized");

      // Step 5: Verify claim was approved
      const finalClaim = await claimManager.claims(claimId);
      expect(finalClaim.finalized).to.be.true;
      expect(finalClaim.approved).to.be.true;
    });

    it("Should reject claims with insufficient support", async function () {
      const policyId = ethers.keccak256(
        ethers.toUtf8Bytes("rejected-claim-policy")
      );
      const dstPayoutVault = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      );

      // Open claim
      await claimManager
        .connect(alice)
        .openClaim(
          policyId,
          await alice.getAddress(),
          CLAIM_AMOUNT,
          SEPOLIA_CHAIN_SELECTOR,
          dstPayoutVault
        );

      const claimId = 0n;

      // Only one voter rejects (insufficient quorum)
      await claimManager.connect(bob).voteNo(claimId);
      // Charlie doesn't vote at all

      // Fast forward past voting period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      // Finalize claim
      await claimManager.connect(alice).finalizeClaim(claimId, {
        value: ethers.parseEther("0.1"),
      });

      // Verify claim was rejected
      const finalClaim = await claimManager.claims(claimId);
      expect(finalClaim.finalized).to.be.true;
      expect(finalClaim.approved).to.be.false;
    });

    it("Should handle mixed voting scenarios", async function () {
      const policyId = ethers.keccak256(
        ethers.toUtf8Bytes("mixed-voting-policy")
      );
      const dstPayoutVault = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      );

      // Open claim
      await claimManager
        .connect(alice)
        .openClaim(
          policyId,
          await alice.getAddress(),
          CLAIM_AMOUNT,
          SEPOLIA_CHAIN_SELECTOR,
          dstPayoutVault
        );

      const claimId = 0n;

      // Mixed voting: Bob votes yes (more voting power), Charlie votes no
      await claimManager.connect(bob).voteYes(claimId);
      await claimManager.connect(charlie).voteNo(claimId);

      // Fast forward and finalize
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      await claimManager.connect(alice).finalizeClaim(claimId, {
        value: ethers.parseEther("0.1"),
      });

      // Should be approved since Bob has more voting power
      const finalClaim = await claimManager.claims(claimId);
      expect(finalClaim.finalized).to.be.true;
      expect(finalClaim.approved).to.be.true;
    });
  });

  describe("🔗 Cross-Chain Message Simulation", function () {
    it("Should simulate LP staking triggering voting power sync", async function () {
      const initialVotingPower = await votingMirror.vPowerOf(
        await bob.getAddress()
      );
      expect(initialVotingPower).to.equal(0);

      // Bob stakes in LP vault
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      const stakeTx = await lpVault.connect(bob).deposit(LP_DEPOSIT);

      // Check if CCIP message would be sent (via events)
      const receipt = await stakeTx.wait();
      const messageSentEvents =
        receipt?.logs.filter(
          (log) =>
            log.topics[0] ===
            ethers.id("MessageSent(bytes32,uint64,bytes,bytes)")
        ) || [];

      console.log(`      📡 CCIP messages sent: ${messageSentEvents.length}`);

      // Simulate receiving the message on Hedera (VotingMirror)
      const bobStakes = await lpVault.stakes(await bob.getAddress());
      const shares = bobStakes[0];

      // This would normally happen via CCIP message delivery
      await votingMirror.setPower(await bob.getAddress(), shares);

      expect(await votingMirror.vPowerOf(await bob.getAddress())).to.equal(
        shares
      );
      console.log(
        `      🗳️ Voting power synced: ${ethers.formatEther(shares)} shares`
      );
    });

    it("Should simulate policy creation via CCIP", async function () {
      // Setup LP first for premium allocation
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);

      // Alice buys coverage (this sends CCIP message to PolicyManager)
      await pyusd
        .connect(alice)
        .approve(await premiumVault.getAddress(), PREMIUM_AMOUNT);

      const policyTerms = {
        poolId: ethers.keccak256(ethers.toUtf8Bytes("ccip-test-pool")),
        buyer: await alice.getAddress(),
        coverageAmount: COVERAGE_AMOUNT,
        startTs: BigInt(Math.floor(Date.now() / 1000)) + 100n,
        endTs: BigInt(Math.floor(Date.now() / 1000)) + 86400n * 30n,
        policyRef: ethers.keccak256(ethers.toUtf8Bytes("ccip-test-policy")),
      };

      const hederaReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      );

      const coverageTx = await premiumVault
        .connect(alice)
        .buyCoverage(
          HEDERA_CHAIN_SELECTOR,
          hederaReceiver,
          policyTerms,
          PREMIUM_AMOUNT,
          { value: ethers.parseEther("0.1") }
        );

      // Verify CCIP message would be sent
      const receipt = await coverageTx.wait();
      const messageSentEvents =
        receipt?.logs.filter(
          (log) =>
            log.topics[0] ===
            ethers.id("MessageSent(bytes32,uint64,bytes,bytes)")
        ) || [];

      expect(messageSentEvents.length).to.be.gt(
        0,
        "CCIP message should be sent for policy creation"
      );
      console.log(`      📜 Policy creation CCIP message sent`);
    });

    it("Should simulate complete cross-chain workflow", async function () {
      console.log(
        "      🚀 Starting complete cross-chain workflow simulation..."
      );

      // Step 1: LP provides liquidity (Sepolia)
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await lpVault.connect(bob).deposit(LP_DEPOSIT);
      console.log("      1️⃣ LP provided liquidity on Sepolia");

      // Step 2: Simulate voting power sync (Sepolia -> Hedera)
      const bobStakes = await lpVault.stakes(await bob.getAddress());
      await votingMirror.setPower(await bob.getAddress(), bobStakes[0]);
      console.log("      2️⃣ Voting power synced to Hedera");

      // Step 3: User buys coverage (Sepolia -> Hedera)
      await pyusd
        .connect(alice)
        .approve(await premiumVault.getAddress(), PREMIUM_AMOUNT);

      const policyTerms = {
        poolId: ethers.keccak256(ethers.toUtf8Bytes("workflow-pool")),
        buyer: await alice.getAddress(),
        coverageAmount: COVERAGE_AMOUNT,
        startTs: BigInt(Math.floor(Date.now() / 1000)) + 100n,
        endTs: BigInt(Math.floor(Date.now() / 1000)) + 86400n * 30n,
        policyRef: ethers.keccak256(ethers.toUtf8Bytes("workflow-policy")),
      };

      const hederaReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      );

      await premiumVault
        .connect(alice)
        .buyCoverage(
          HEDERA_CHAIN_SELECTOR,
          hederaReceiver,
          policyTerms,
          PREMIUM_AMOUNT,
          { value: ethers.parseEther("0.1") }
        );
      console.log("      3️⃣ Coverage purchased, policy created via CCIP");

      // Step 4: Claim is opened and voted on (Hedera)
      const claimPolicyId = ethers.keccak256(
        ethers.toUtf8Bytes("workflow-claim")
      );
      const dstPayoutVault = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await payoutVault.getAddress()]
      );

      await claimManager
        .connect(alice)
        .openClaim(
          claimPolicyId,
          await alice.getAddress(),
          CLAIM_AMOUNT,
          SEPOLIA_CHAIN_SELECTOR,
          dstPayoutVault
        );

      await claimManager.connect(bob).voteYes(0n);
      console.log("      4️⃣ Claim opened and voted on Hedera");

      // Step 5: Fast forward and finalize claim (Hedera -> Sepolia)
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      const payoutBalanceBefore = await pyusd.balanceOf(
        await payoutVault.getAddress()
      );

      await claimManager.connect(alice).finalizeClaim(0n, {
        value: ethers.parseEther("0.1"),
      });
      console.log("      5️⃣ Claim finalized, payout triggered via CCIP");

      // Verify the complete workflow maintained system integrity
      const finalClaim = await claimManager.claims(0n);
      expect(finalClaim.approved).to.be.true;

      const lpBalance = await pyusd.balanceOf(await lpVault.getAddress());
      expect(lpBalance).to.be.gt(
        LP_DEPOSIT,
        "LP should have earned from premium"
      );

      console.log(
        "      ✅ Complete cross-chain workflow executed successfully!"
      );
    });
  });

  describe("⚡ Performance and Gas Optimization", function () {
    it("Should measure gas usage for key operations", async function () {
      // Setup
      await pyusd.connect(bob).approve(await lpVault.getAddress(), LP_DEPOSIT);
      await pyusd
        .connect(alice)
        .approve(await premiumVault.getAddress(), PREMIUM_AMOUNT);

      // Measure LP deposit
      const depositTx = await lpVault.connect(bob).deposit(LP_DEPOSIT);
      const depositReceipt = await depositTx.wait();
      console.log(`      ⛽ LP Deposit: ${depositReceipt?.gasUsed} gas`);

      // Measure coverage purchase
      const policyTerms = {
        poolId: ethers.keccak256(ethers.toUtf8Bytes("gas-test-pool")),
        buyer: await alice.getAddress(),
        coverageAmount: COVERAGE_AMOUNT,
        startTs: BigInt(Math.floor(Date.now() / 1000)) + 100n,
        endTs: BigInt(Math.floor(Date.now() / 1000)) + 86400n * 30n,
        policyRef: ethers.keccak256(ethers.toUtf8Bytes("gas-test-policy")),
      };

      const hederaReceiver = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [await policyManager.getAddress()]
      );

      const coverageTx = await premiumVault
        .connect(alice)
        .buyCoverage(
          HEDERA_CHAIN_SELECTOR,
          hederaReceiver,
          policyTerms,
          PREMIUM_AMOUNT,
          { value: ethers.parseEther("0.1") }
        );
      const coverageReceipt = await coverageTx.wait();
      console.log(
        `      ⛽ Coverage Purchase: ${coverageReceipt?.gasUsed} gas`
      );

      // Verify gas usage is reasonable
      expect(depositReceipt?.gasUsed).to.be.lt(
        500000n,
        "LP deposit should be < 500k gas"
      );
      expect(coverageReceipt?.gasUsed).to.be.lt(
        1000000n,
        "Coverage should be < 1M gas"
      );
    });
  });
});
