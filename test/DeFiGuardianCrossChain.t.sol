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

contract DeFiGuardianCrossChainTest is Test {
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
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public owner = address(0x4);

    // Test constants
    uint256 public constant PREMIUM_AMOUNT = 1000e6; // 1000 PYUSD
    uint256 public constant COVERAGE_AMOUNT = 10000e6; // 10000 PYUSD coverage
    uint256 public constant LP_DEPOSIT = 5000e6; // 5000 PYUSD LP deposit

    function setUp() public {
        // Deploy mock contracts
        mockRouter = new MockCCIPRouter();
        pyusd = new MockPYUSD();

        // Deploy Arbitrum contracts
        lpVault = new LPVault(address(pyusd), address(mockRouter), owner);
        payoutVault = new PayoutVault(address(mockRouter), address(pyusd), owner);
        premiumVault = new PremiumVault(address(mockRouter), address(pyusd), address(lpVault), address(payoutVault), owner);

        // Deploy Hedera contracts
        policyManager = new PolicyManager(address(mockRouter), owner);
        votingMirror = new VotingMirror(address(mockRouter), owner);
        claimManager = new ClaimManager(address(mockRouter), address(votingMirror), address(policyManager), owner);

        // Fund test accounts
        pyusd.mint(alice, 10000e6);
        pyusd.mint(bob, 10000e6);
        pyusd.mint(charlie, 10000e6);
        pyusd.mint(owner, 20000e6);

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

    // ============ CROSS-CHAIN PREMIUM FLOW TESTS ============

    function test_CompletePremiumFlow() public {
        // 1. Alice buys coverage on Arbitrum
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
        
        bytes32 messageId = premiumVault.buyCoverage{value: 0.1 ether}(
            1, // Hedera selector
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        
        vm.stopPrank();

        // Verify premium was collected and split
        assertEq(pyusd.balanceOf(address(lpVault)), 700e6, "LP vault should have 70%");
        assertEq(pyusd.balanceOf(address(payoutVault)), 300e6, "Payout vault should have 30%");

        // 2. Simulate CCIP message delivery to Hedera PolicyManager
        bytes memory policyPayload = abi.encode(terms);
        
        // Mock CCIP message delivery to Hedera PolicyManager
        vm.prank(address(mockRouter));
        (bool success, ) = address(policyManager).call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    messageId, // messageId
                    1, // sourceChainSelector (Arbitrum)
                    abi.encode(address(premiumVault)), // sender
                    policyPayload, // data
                    new address[](0), // destTokenAmounts
                    new uint256[](0)
                )
            )
        );
        require(success, "CCIP delivery failed");

        // 3. Verify policy was registered on Hedera
        bytes32 policyId = keccak256(abi.encode(terms));
        PolicyManager.Policy memory policy = policyManager.getPolicy(policyId);
        assertEq(policy.buyer, alice, "Policy buyer should match");
        assertEq(policy.coverageAmount, COVERAGE_AMOUNT, "Coverage amount should match");
        assertTrue(policy.active, "Policy should be active");
    }

    // ============ CROSS-CHAIN LP GOVERNANCE TESTS ============

    function test_LPVotingPowerSync() public {
        // 1. Bob becomes LP on Arbitrum
        vm.startPrank(bob);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        // 2. Simulate CCIP sync to Hedera VotingMirror
        bytes memory lpPayload = abi.encode(bob, LP_DEPOSIT, block.timestamp + 1 days);
        
        _mockCCIPReceive(address(votingMirror), keccak256("message1"), 1, abi.encode(address(lpVault)), lpPayload);

        // 3. Verify voting power was set on Hedera
        assertEq(votingMirror.vPowerOf(bob), LP_DEPOSIT, "Voting power should match LP deposit");
        assertEq(votingMirror.totalPower(), LP_DEPOSIT, "Total power should match");
    }

    // ============ CROSS-CHAIN CLAIMS FLOW TESTS ============

    function test_CompleteClaimsFlow() public {
        // Setup: Create policy and LP
        _setupPolicyAndLP();

        // Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // 1. Alice opens claim on Hedera
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            5000e6, // claim amount
            1, // destination chain selector (Arbitrum)
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        uint256 claimId = 1;

        // 2. LPs vote on claim
        vm.startPrank(bob);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(claimId);
        vm.stopPrank();

        // 3. Fast forward and finalize claim
        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: 0.1 ether}(claimId);

        // 4. Verify claim was approved
        (bytes32 policyId, address claimant, uint256 amount, uint64 startTs, uint64 endTs, uint64 dstChainSelector, bytes memory dstPayoutVault, bool finalized, bool approved, uint256 yes, uint256 no) = claimManager.claims(claimId);
        assertTrue(finalized, "Claim should be finalized");
        assertTrue(approved, "Claim should be approved");

        // 5. Simulate CCIP payout message to Arbitrum
        bytes memory payoutPayload = abi.encode(
            keccak256("TAG_PAYOUT_V1"), // TAG_PAYOUT_V1
            claimId,
            alice,
            5000e6
        );

        _mockCCIPReceive(address(payoutVault), keccak256("message2"), 2, abi.encode(address(claimManager)), payoutPayload);

        // 6. Verify payout was executed on Arbitrum
        assertEq(pyusd.balanceOf(alice), 14000e6, "Alice should receive payout"); // 9000 + 5000
    }

    // ============ HELPER FUNCTIONS ============

    function _setupPolicyAndLP() internal {
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
        
        premiumVault.buyCoverage{value: 0.1 ether}(
            1,
            abi.encode(address(policyManager)),
            terms,
            PREMIUM_AMOUNT
        );
        vm.stopPrank();

        // Bob and Charlie become LPs
        vm.startPrank(bob);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        vm.startPrank(charlie);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        // Sync LP voting power to Hedera
        _syncLPVotingPower();
    }

    function _syncLPVotingPower() internal {
        // Mock CCIP messages for LP sync
        bytes memory bobPayload = abi.encode(bob, LP_DEPOSIT, block.timestamp + 1 days);
        bytes memory charliePayload = abi.encode(charlie, LP_DEPOSIT, block.timestamp + 1 days);

        _mockCCIPReceive(address(votingMirror), keccak256("message3"), 1, abi.encode(address(lpVault)), bobPayload);
        _mockCCIPReceive(address(votingMirror), keccak256("message4"), 1, abi.encode(address(lpVault)), charliePayload);
    }

    // ============ HELPER FUNCTIONS ============

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

    // ============ SECURITY TESTS ============

    function test_RevertUnauthorizedCCIP() public {
        // Try to send CCIP message from unauthorized sender
        bytes memory payload = abi.encode("test");
        
        vm.prank(address(mockRouter));
        vm.expectRevert();
        (bool success, ) = address(policyManager).call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    keccak256("message5"), // messageId
                    1, // sourceChainSelector (Arbitrum)
                    abi.encode(address(0x999)), // unauthorized sender
                    payload, // data
                    new address[](0), // destTokenAmounts
                    new uint256[](0)
                )
            )
        );
    }

    function test_RevertDuplicateMessage() public {
        bytes memory payload = abi.encode("test");
        
        // Send first message
        _mockCCIPReceive(address(policyManager), keccak256("message6"), 1, abi.encode(address(premiumVault)), payload);

        // Try to send same message again
        vm.prank(address(mockRouter));
        vm.expectRevert();
        (bool success, ) = address(policyManager).call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                abi.encode(
                    keccak256("message6"), // Same message ID
                    1, // sourceChainSelector (Arbitrum)
                    abi.encode(address(premiumVault)), // sender
                    payload, // data
                    new address[](0), // destTokenAmounts
                    new uint256[](0)
                )
            )
        );
    }

    // ============ INTEGRATION TESTS ============

    function test_FullSystemIntegration() public {
        // 1. Setup complete system
        _setupPolicyAndLP();

        // 2. Fund payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // 3. Verify system state
        assertEq(pyusd.balanceOf(address(lpVault)), 1400e6, "LP vault should have 2x LP deposits + premium");
        assertEq(pyusd.balanceOf(address(payoutVault)), 10300e6, "Payout vault should have funding + premium reserve");
        assertEq(votingMirror.totalPower(), 10000e6, "Total voting power should match LP deposits");

        // 4. Test claim flow
        vm.startPrank(alice);
        claimManager.openClaim(
            "POOL_001",
            alice,
            3000e6, // claim amount
            1,
            abi.encode(address(payoutVault))
        );
        vm.stopPrank();

        // 5. Vote and finalize
        vm.startPrank(bob);
        claimManager.voteYes(1);
        vm.stopPrank();

        vm.startPrank(charlie);
        claimManager.voteYes(1);
        vm.stopPrank();

        vm.warp(block.timestamp + 6 minutes);
        vm.prank(alice);
        claimManager.finalizeClaim{value: 0.1 ether}(1);

        // 6. Verify final state
        assertEq(pyusd.balanceOf(alice), 12000e6, "Alice should have original balance - premium + payout");
    }
}
