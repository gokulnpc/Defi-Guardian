// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IVotingMirror {
    function allowlistSourceChain(uint64 selector, bool allowed) external;
    function allowlistSender(bytes calldata sender, bool allowed) external;
    function vPowerOf(address lp) external view returns (uint256);
    function totalPower() external view returns (uint256);
    function ccipReceive(bytes calldata message) external;
}
