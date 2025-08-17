// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPayoutVault {
    function allowlistSourceChain(uint64 selector, bool allowed) external;
    function allowlistSender(bytes calldata sender, bool allowed) external;
    function depositPYUSD(uint256 amount) external;
    function ccipReceive(bytes calldata message) external;
}
