// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ILPVault {
    function deposit(uint256 amount) external returns (uint256);
    function requestWithdraw(uint256 shares) external;
    function finalizeWithdraw() external;
    function totalShares() external view returns (uint256);
    function stakes(address lp) external view returns (uint256 shares, uint256 lockedUntil);
}
