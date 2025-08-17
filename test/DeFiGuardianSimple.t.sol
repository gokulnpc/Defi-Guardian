// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {PremiumVault} from "../contracts/PremiumVault.sol";
import {LPVault} from "../contracts/LPVault.sol";
import {PayoutVault} from "../contracts/PayoutVault.sol";
import {MockPYUSD} from "./mocks/MockPYUSD.sol";
import {MockCCIPRouter} from "./mocks/MockCCIPRouter.sol";

contract DeFiGuardianSimpleTest is Test {
    MockCCIPRouter public mockRouter;
    MockPYUSD public pyusd;

    // Contracts
    PremiumVault public premiumVault;
    LPVault public lpVault;
    PayoutVault public payoutVault;

    // Test addresses
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public owner = address(0x4);

    // Test constants
    uint256 public constant PREMIUM_AMOUNT = 1000e6; // 1000 PYUSD (6 decimals)
    uint256 public constant COVERAGE_AMOUNT = 10000e6; // 10000 PYUSD coverage
    uint256 public constant LP_DEPOSIT = 5000e6; // 5000 PYUSD LP deposit

    function setUp() public {
        // Deploy mock contracts
        mockRouter = new MockCCIPRouter();
        pyusd = new MockPYUSD();

        // Deploy main contracts
        lpVault = new LPVault(address(pyusd), address(mockRouter), owner);
        payoutVault = new PayoutVault(address(mockRouter), address(pyusd), owner);
        premiumVault = new PremiumVault(address(mockRouter), address(pyusd), address(lpVault), address(payoutVault), owner);

        // Fund test accounts
        pyusd.mint(alice, 10000e6);
        pyusd.mint(bob, 10000e6);
        pyusd.mint(owner, 20000e6); // Fund owner for payout vault deposits

        // Setup basic configuration
        _setupBasicConfig();
    }

    function _setupBasicConfig() internal {
        vm.startPrank(owner);
        
        // Allow destination chains
        premiumVault.allowlistDestChain(1, true); // Hedera
        premiumVault.allowlistReceiver(abi.encode(address(0x123)), true);
        premiumVault.setGasLimit(1, 200000);
        
        vm.stopPrank();
    }

    // ============ BASIC FUNCTIONALITY TESTS ============

    function test_LPDeposit() public {
        vm.startPrank(bob);

        // Approve PYUSD spending
        pyusd.approve(address(lpVault), LP_DEPOSIT);

        // Deposit as LP
        lpVault.deposit(LP_DEPOSIT);

        // Verify shares were minted
        (uint256 shares, ) = lpVault.stakes(bob);
        assertGt(shares, 0, "Shares should be minted");
        assertEq(lpVault.totalShares(), shares, "Total shares should match");

        // Verify PYUSD was transferred
        assertEq(pyusd.balanceOf(address(lpVault)), LP_DEPOSIT, "LP vault should have PYUSD");

        vm.stopPrank();
    }

    function test_LPWithdrawal() public {
        vm.startPrank(bob);

        // Deposit as LP
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);

        // Get shares and request withdrawal
        (uint256 shares, ) = lpVault.stakes(bob);
        lpVault.requestWithdraw(shares);

        // Fast forward past cooldown
        vm.warp(block.timestamp + 1 days + 1);

        // Finalize withdrawal
        lpVault.finalizeWithdraw();

        // Verify withdrawal
        assertEq(lpVault.totalShares(), 0, "Total shares should be zero");
        assertEq(pyusd.balanceOf(bob), 10000e6, "Bob should have PYUSD back");

        vm.stopPrank();
    }

    function test_PremiumAllocation() public {
        // Check premium allocation (70% to LP, 30% to reserve)
        (uint256 toLP, uint256 toReserve) = premiumVault.previewAllocation(PREMIUM_AMOUNT);
        
        assertEq(toLP, 700e6, "70% should go to LP");
        assertEq(toReserve, 300e6, "30% should go to reserve");
    }

    function test_PayoutVaultDeposit() public {
        vm.startPrank(owner);
        
        // Fund payout vault
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        
        assertEq(pyusd.balanceOf(address(payoutVault)), 10000e6, "Payout vault should have PYUSD");
        
        vm.stopPrank();
    }

    // ============ EDGE CASES & ERROR TESTS ============

    function test_RevertWhenInsufficientBalance() public {
        address poorUser = address(0x999);
        
        vm.startPrank(poorUser);
        
        // Try to deposit without any PYUSD
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        vm.expectRevert();
        lpVault.deposit(LP_DEPOSIT);
        
        vm.stopPrank();
    }

    function test_RevertWhenNotOwner() public {
        vm.startPrank(alice);
        
        // Try to call owner-only function
        vm.expectRevert();
        premiumVault.allowlistDestChain(1, true);
        
        vm.stopPrank();
    }

    function test_RevertWhenZeroAmount() public {
        vm.startPrank(bob);
        
        // Try to deposit zero amount
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        vm.expectRevert();
        lpVault.deposit(0);
        
        vm.stopPrank();
    }

    // ============ INTEGRATION TESTS ============

    function test_LPAndPayoutVaultIntegration() public {
        // Bob becomes LP
        vm.startPrank(bob);
        pyusd.approve(address(lpVault), LP_DEPOSIT);
        lpVault.deposit(LP_DEPOSIT);
        vm.stopPrank();

        // Owner funds payout vault
        vm.startPrank(owner);
        pyusd.approve(address(payoutVault), 10000e6);
        payoutVault.depositPYUSD(10000e6);
        vm.stopPrank();

        // Verify total system liquidity
        uint256 totalLiquidity = pyusd.balanceOf(address(lpVault)) + pyusd.balanceOf(address(payoutVault));
        assertEq(totalLiquidity, 15000e6, "Total system liquidity should be 15000 PYUSD");
    }

    function test_PremiumVaultConfiguration() public {
        vm.startPrank(owner);
        
        // Test premium splits configuration
        premiumVault.setPremiumSplits(8000, 2000); // 80% LP, 20% reserve
        
        (uint256 toLP, uint256 toReserve) = premiumVault.previewAllocation(PREMIUM_AMOUNT);
        assertEq(toLP, 800e6, "80% should go to LP");
        assertEq(toReserve, 200e6, "20% should go to reserve");
        
        vm.stopPrank();
    }
}
