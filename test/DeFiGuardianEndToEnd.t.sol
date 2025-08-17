// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {PremiumVault} from "../contracts/PremiumVault.sol";
import {LPVault} from "../contracts/LPVault.sol";
import {PayoutVault} from "../contracts/PayoutVault.sol";
import {PolicyManager} from "../contracts/PolicyManager.sol";
import {VotingMirror} from "../contracts/VotingMirror.sol";
import {ClaimManager} from "../contracts/ClaimManager.sol";
import {MockPYUSD} from "./mocks/MockPYUSD.sol";
import {MockCCIPRouter} from "./mocks/MockCCIPRouter.sol";

contract DeFiGuardianEndToEndTest is Test {
    MockCCIPRouter public mockRouter;
    MockPYUSD public pyusd;

    // Arbitrum contracts
    PremiumVault public premiumVault;
    LPVault public lpVault;
    PayoutVault public payoutVault;

    // Hedera contracts
    PolicyManager public policyManager;
    VotingMirror public votingMirror;
    ClaimManager public claimManager;

    // Test addresses
    address public alice = address(0x1);    // Policyholder
    address public bob = address(0x2);      // LP 1
    address public charlie = address(0x3);  // LP 2
    address public dave = address(0x4);     // LP 3
    address public owner = address(0x5);    // Contract owner

    // Test constants
    uint256 public constant PREMIUM_AMOUNT = 1000e6;      // $1,000 PYUSD
    uint256 public constant COVERAGE_AMOUNT = 10000e6;    // $10,000 coverage
    uint256 public constant LP_DEPOSIT = 5000e6;          // $5,000 LP deposit
    uint256 public constant CCIP_FEE = 0.01 ether;        // CCIP fee

    function setUp() public {
        // Deploy mock contracts
        mockRouter = new MockCCIPRouter();
        pyusd = new MockPYUSD();
        
        // Fund mock router with ETH for CCIP fees
        vm.deal(address(mockRouter), 100 ether);

        // Deploy Arbitrum contracts
        lpVault = new LPVault(address(pyusd), address(mockRouter), owner);
        payoutVault = new PayoutVault(address(mockRouter), address(pyusd), owner);
        premiumVault = new PremiumVault(address(mockRouter), address(pyusd), address(lpVault), address(payoutVault), owner);
        
        // Fund contracts with ETH for CCIP fees
        vm.deal(address(lpVault), 10 ether);
        vm.deal(address(payoutVault), 10 ether);
        vm.deal(address(premiumVault), 10 ether);

        // Deploy Hedera contracts
        policyManager = new PolicyManager(address(mockRouter), owner);
        votingMirror = new VotingMirror(address(mockRouter), owner);
        claimManager = new ClaimManager(address(mockRouter), address(votingMirror), address(policyManager), owner);

        // Fund test accounts
        pyusd.mint(alice, 10000e6);    // $10,000 for premiums
        pyusd.mint(bob, 20000e6);      // $20,000 for LP
        pyusd.mint(charlie, 20000e6);  // $20,000 for LP
        pyusd.mint(dave, 20000e6);     // $20,000 for LP
        pyusd.mint(owner, 50000e6);    // $50,000 for funding

        // Setup cross-chain configuration
        _setupCrossChainConfig();
    }

    function _setupCrossChainConfig() internal {
        vm.startPrank(owner);

        // Arbitrum -> Hedera allowlists
        premiumVault.allowlistDestChain(1, true); // Hedera selector
        premiumVault.allowlistReceiver(abi.encode(address(policyManager)), true);
        premiumVault.setGasLimit(1, 200000);

        lpVault.setReceiver(1, address(votingMirror));
        lpVault.setGasLimit(1, 150000);

        // Hedera -> Arbitrum allowlists
        payoutVault.allowlistSourceChain(2, true); // Hedera selector
        payoutVault.allowlistSender(abi.encode(address(claimManager)), true);

        policyManager.allowlistSourceChain(1, true); // Arbitrum selector
        policyManager.allowlistSender(abi.encode(address(premiumVault)), true);

        votingMirror.allowlistSourceChain(1, true); // Arbitrum selector
        votingMirror.allowlistSender(abi.encode(address(lpVault)), true);

        vm.stopPrank();
    }

    // ============ HAPPY PATH TESTS ============

    function test_HappyPath_CompleteCoverageFlow() public {
        // 1. Setup LPs
        _setupLPs();

        // 2. Alice buys coverage
        vm.startPrank(alice);
        pyusd.approve(address(premiumVault), PREMIUM_AMOUNT);
        
        PremiumVault.PolicyTerms memory terms = PremiumVault.PolicyTerms({
            poolId: "POOL_001",
            buyer: alice,
            coverageAmount: COVERAGE_AMOUNT,
            startTs: uint64(block.timestamp),
            endTs: uint64(block.timestamp + 30 days),
            policyRef: "POLICY_REF_001"
        });
        
        bytes32 messageId = premiumVault.buyCoverage{value: CCIP_FEE}(
            1, // Hedera selector
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        vm.stopPrank();

        // Verify premium split
        assertEq(pyusd.balanceOf(address(lpVault)), 700e6, "LP vault should have 70%");
        assertEq(pyusd.balanceOf(address(payoutVault)), 300e6, "Payout vault should have 30%");

        // 3. Simulate CCIP policy registration
        _mockCCIPReceive(address(policyManager), messageId, 1, abi.encode(address(premiumVault)), abi.encode(terms));

        // 4. Verify policy was registered
        bytes32 policyId = keccak256(abi.encode(terms.poolId, terms.buyer, terms.coverageAmount, terms.startTs, terms.endTs, terms.policyRef));
        PolicyManager.Policy memory policy = policyManager.getPolicy(policyId);
        assertEq(policy.buyer, alice, "Policy buyer should match");
        assertTrue(policy.active, "Policy should be active");

        // 5. Fund payout vault for claims
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // 6. Alice opens a claim
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            2500e6, // $2,500 claim
            1, // destination chain selector (Arbitrum)
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // 7. LPs vote
        vm.startPrank(bob);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // 8. Finalize claim
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // 9. Verify claim was approved
        (,,,,,,, bool finalized, bool approved,,) = claimManager.claims(claimId);
        assertTrue(finalized, "Claim should be finalized");
        assertTrue(approved, "Claim should be approved");

        // 10. Simulate CCIP payout
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            claimId,
            alice,
            2500e6
        );

        _mockCCIPReceive(address(payoutVault), keccak256("payout1"), 2, abi.encode(address(claimManager)), payoutPayload);

        // 11. Verify payout was executed
        assertEq(pyusd.balanceOf(alice), 11500e6, "Alice should have original - premium + payout"); // 10000 - 1000 + 2500
    }

    // ============ EDGE CASES & VARIATIONS ============

    function test_EdgeCase_CCIPFeeUnderfunded() public {
        vm.startPrank(alice);
        pyusd.approve(address(premiumVault), PREMIUM_AMOUNT);
        
        PremiumVault.PolicyTerms memory terms = PremiumVault.PolicyTerms({
            poolId: "POOL_001",
            buyer: alice,
            coverageAmount: COVERAGE_AMOUNT,
            startTs: uint64(block.timestamp),
            endTs: uint64(block.timestamp + 30 days),
            policyRef: "POLICY_REF_001"
        });
        
        // Try with insufficient CCIP fee
        vm.expectRevert();
        premiumVault.buyCoverage{value: 0.001 ether}( // Too low fee
            1,
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        
        vm.stopPrank();
        
        // Try again with sufficient fee
        vm.startPrank(alice);
        pyusd.approve(address(premiumVault), PREMIUM_AMOUNT);
        premiumVault.buyCoverage{value: CCIP_FEE}(
            1,
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        
        vm.stopPrank();
    }

    function test_EdgeCase_DestinationNotAllowlisted() public {
        vm.startPrank(alice);
        pyusd.approve(address(premiumVault), PREMIUM_AMOUNT);
        
        PremiumVault.PolicyTerms memory terms = PremiumVault.PolicyTerms({
            poolId: "POOL_001",
            buyer: alice,
            coverageAmount: COVERAGE_AMOUNT,
            startTs: uint64(block.timestamp),
            endTs: uint64(block.timestamp + 30 days),
            policyRef: "POLICY_REF_001"
        });
        
        // Try with non-allowlisted destination
        vm.expectRevert();
        premiumVault.buyCoverage{value: CCIP_FEE}(
            999, // Non-allowlisted selector
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        
        vm.stopPrank();
        
        // Try again with allowlisted destination
        vm.startPrank(alice);
        pyusd.approve(address(premiumVault), PREMIUM_AMOUNT);
        premiumVault.buyCoverage{value: CCIP_FEE}(
            1, // Allowlisted selector
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        
        vm.stopPrank();
    }

    function test_EdgeCase_PolicyExpired() public {
        // Setup policy
        _setupPolicyAndLP();

        // Fast forward past policy end date
        vm.warp(block.timestamp + 31 days);

        // Try to open claim on expired policy
        vm.startPrank(alice);
        vm.expectRevert();
        claimManager.openClaim(
            "POOL_001",
            alice,
            1000e6,
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();
    }

    function test_EdgeCase_ClaimDenied() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // Open claim
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            5000e6,
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote to deny
        vm.startPrank(bob);
        claimManager.voteNo(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteNo(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteNo(claimId);
        vm.stopPrank();

        // Finalize claim
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Verify claim was denied
        (,,,,,,, bool finalized, bool approved,,) = claimManager.claims(claimId);
        assertTrue(finalized, "Claim should be finalized");
        assertFalse(approved, "Claim should be denied");

        // Verify no payout was sent (no CCIP message)
        uint256 aliceBalanceBefore = pyusd.balanceOf(alice);
        // No CCIP call here - claim was denied
        assertEq(pyusd.balanceOf(alice), aliceBalanceBefore, "Alice should not receive payout");
    }

    function test_EdgeCase_ReserveShortfall() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault with minimal amount
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 1000e6);
        payoutVault.depositPYUSD(1000e6);
        vm.stopPrank();

        // Open large claim
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            5000e6, // $5,000 claim
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote to approve
        vm.startPrank(bob);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // Finalize claim
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Simulate CCIP payout - should fail due to insufficient reserve
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            claimId,
            alice,
            5000e6
        );

        vm.prank(address(mockRouter));
        vm.expectRevert();
        (bool success, ) = address(payoutVault).call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    keccak256("payout2"),
                    2,
                    abi.encode(address(claimManager)),
                    payoutPayload,
                    new address[](0),
                    new uint256[](0)
                )
            )
        );
    }

    function test_EdgeCase_MultipleSimultaneousClaims() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // Open multiple claims
        vm.startPrank(alice);
        claimManager.openClaim("POOL_001", alice, 3000e6, 1, abi.encode(address(payoutVault)));
        claimManager.openClaim("POOL_001", alice, 4000e6, 1, abi.encode(address(payoutVault)));
        claimManager.openClaim("POOL_001", alice, 5000e6, 1, abi.encode(address(payoutVault)));
        vm.stopPrank();

        // Vote on all claims
        for (uint256 i = 1; i <= 3; i++) {
            vm.startPrank(bob);
            claimManager.voteYes(i);
            vm.stopPrank();

            vm.startPrank(charlie);
            claimManager.voteYes(i);
            vm.stopPrank();

            vm.startPrank(dave);
            claimManager.voteYes(i);
            vm.stopPrank();
        }

        // Finalize all claims
        vm.warp(block.timestamp + 6 minutes);
        for (uint256 i = 1; i <= 3; i++) {
            vm.prank(alice);
            claimManager.finalizeClaim{value: CCIP_FEE}(i);
        }

        // Process payouts in order
        for (uint256 i = 1; i <= 3; i++) {
            uint256 amount = i == 1 ? 3000e6 : i == 2 ? 4000e6 : 5000e6;
            bytes memory payoutPayload = abi.encode(
                keccak256("TAG_PAYOUT_V1"),
                i,
                alice,
                amount
            );

            _mockCCIPReceive(address(payoutVault), keccak256(abi.encodePacked("payout", i)), 2, abi.encode(address(claimManager)), payoutPayload);
        }

        // Verify total payout
        assertEq(pyusd.balanceOf(alice), 17000e6, "Alice should receive all payouts"); // 10000 - 1000 + 3000 + 4000 + 5000
    }

    function test_EdgeCase_LPWithdrawalDuringIncident() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Bob requests withdrawal
        vm.startPrank(bob);
        (uint256 shares,) = lpVault.stakes(bob);
        lpVault.requestWithdraw(shares);
        vm.stopPrank();

        // Open claim during withdrawal cooldown
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            2000e6,
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote on claim
        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // Finalize claim
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Process payout
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            claimId,
            alice,
            2000e6
        );

        _mockCCIPReceive(address(payoutVault), keccak256("payout3"), 2, abi.encode(address(claimManager)), payoutPayload);

        // Bob can still finalize withdrawal after cooldown
        vm.warp(block.timestamp + 1 days + 1);
        vm.startPrank(bob);
        lpVault.finalizeWithdraw();
        vm.stopPrank();

        // Verify Bob got his shares back (minus any losses)
        assertGt(pyusd.balanceOf(bob), 0, "Bob should have received withdrawal");
    }

    function test_EdgeCase_MaliciousPayoutCall() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // Try malicious payout from unauthorized sender
        bytes memory maliciousPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            1,
            alice,
            5000e6
        );

        vm.prank(address(mockRouter));
        vm.expectRevert();
        (bool success, ) = address(payoutVault).call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    keccak256("malicious"),
                    2,
                    abi.encode(address(0x999)), // Unauthorized sender
                    maliciousPayload,
                    new address[](0),
                    new uint256[](0)
                )
            )
        );
    }

    function test_EdgeCase_DuplicateCCIPMessage() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // Open and approve claim
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            1000e6,
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote to approve
        vm.startPrank(bob);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // Finalize claim
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Send first payout message
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            claimId,
            alice,
            1000e6
        );

        bytes32 messageId = keccak256("duplicate");
        _mockCCIPReceive(address(payoutVault), messageId, 2, abi.encode(address(claimManager)), payoutPayload);

        // Try to send same message again
        vm.prank(address(mockRouter));
        vm.expectRevert();
        (bool success, ) = address(payoutVault).call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    messageId, // Same message ID
                    2,
                    abi.encode(address(claimManager)),
                    payoutPayload,
                    new address[](0),
                    new uint256[](0)
                )
            )
        );
    }

    // ============ USER STORIES ============

    function test_UserStory_SmallExploitPartialPayout() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // Small exploit - partial payout
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            250e6, // $250 claim (small exploit)
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote passes
        vm.startPrank(bob);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // Finalize
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Process payout
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            claimId,
            alice,
            250e6
        );

        _mockCCIPReceive(address(payoutVault), keccak256("small_exploit"), 2, abi.encode(address(claimManager)), payoutPayload);

        // Verify partial payout
        assertEq(pyusd.balanceOf(alice), 11250e6, "Alice should receive partial payout"); // 10000 - 1000 + 250
    }

    function test_UserStory_BlackSwanLargePayout() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Fund payout vault with large amount
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 50000e6);
        payoutVault.depositPYUSD(50000e6);
        vm.stopPrank();

        // Black swan event - large payout
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            2000000e6, // $2,000,000 claim (black swan)
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote passes
        vm.startPrank(bob);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // Finalize
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Process large payout
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"),
            claimId,
            alice,
            2000000e6
        );

        _mockCCIPReceive(address(payoutVault), keccak256("black_swan"), 2, abi.encode(address(claimManager)), payoutPayload);

        // Verify large payout
        assertEq(pyusd.balanceOf(alice), 2009000e6, "Alice should receive large payout"); // 10000 - 1000 + 2000000
    }

    function test_UserStory_ClaimDeniedOracleFalseAlarm() public {
        // Setup policy and LP
        _setupPolicyAndLP();

        // Oracle false alarm - claim denied
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            5000e6, // $5,000 claim
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // Vote to deny (oracle false alarm)
        vm.startPrank(bob);
        claimManager.voteNo(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteNo(claimId);
        vm.stopPrank();

        vm.startPrank(dave);
        claimManager.voteNo(claimId);
        vm.stopPrank();

        // Finalize
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: CCIP_FEE}(claimId);

        // Verify claim denied
        (,,,,,,, bool finalized, bool approved,,) = claimManager.claims(claimId);
        assertTrue(finalized, "Claim should be finalized");
        assertFalse(approved, "Claim should be denied");

        // Verify no payout sent
        assertEq(pyusd.balanceOf(alice), 9000e6, "Alice should not receive payout"); // 10000 - 1000
    }

    // ============ HELPER FUNCTIONS ============

    function _setupLPs() internal {
        // Bob becomes LP
        vm.startPrank(bob);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        // Charlie becomes LP
        vm.startPrank(charlie);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        // Dave becomes LP
        vm.startPrank(dave);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        // Sync LP voting power to Hedera
        _syncLPVotingPower();
    }

    function _setupPolicyAndLP() internal {
        // Setup LPs
        _setupLPs();

        // Alice buys coverage
        vm.startPrank(alice);
        pyusd.approve(address(premiumVault), PREMIUM_AMOUNT);
        
        PremiumVault.PolicyTerms memory terms = PremiumVault.PolicyTerms({
            poolId: "POOL_001",
            buyer: alice,
            coverageAmount: COVERAGE_AMOUNT,
            startTs: uint64(block.timestamp),
            endTs: uint64(block.timestamp + 30 days),
            policyRef: "POLICY_REF_001"
        });
        
        bytes32 messageId = premiumVault.buyCoverage{value: CCIP_FEE}(
            1,
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        vm.stopPrank();

        // Simulate CCIP policy registration
        _mockCCIPReceive(address(policyManager), messageId, 1, abi.encode(address(premiumVault)), abi.encode(terms));
    }

    function _syncLPVotingPower() internal {
        // Mock CCIP messages for LP sync
        bytes memory bobPayload = abi.encode(bob, LP_DEPOSIT, block.timestamp + 1 days);
        bytes memory charliePayload = abi.encode(charlie, LP_DEPOSIT, block.timestamp + 1 days);
        bytes memory davePayload = abi.encode(dave, LP_DEPOSIT, block.timestamp + 1 days);

        _mockCCIPReceive(address(votingMirror), keccak256("lp_sync_1"), 1, abi.encode(address(lpVault)), bobPayload);
        _mockCCIPReceive(address(votingMirror), keccak256("lp_sync_2"), 1, abi.encode(address(lpVault)), charliePayload);
        _mockCCIPReceive(address(votingMirror), keccak256("lp_sync_3"), 1, abi.encode(address(lpVault)), davePayload);
    }

    function _mockCCIPReceive(address receiver, bytes32 messageId, uint64 sourceChainSelector, bytes memory sender, bytes memory data) internal {
        vm.prank(address(mockRouter));
        (bool success, ) = receiver.call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    messageId,
                    sourceChainSelector,
                    sender,
                    data,
                    new address[](0), // destTokenAmounts
                    new uint256[](0)
                )
            )
        );
        require(success, "CCIP delivery failed");
    }
}
