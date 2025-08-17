// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPolicyManager {
    struct Policy {
        bytes32 poolId;
        address buyer;
        uint256 coverageAmount;
        uint64 startTs;
        uint64 endTs;
        bytes32 policyRef;
        uint256 tokenId;
        bool active;
    }

    struct PolicyTerms {
        bytes32 poolId;
        address buyer;
        uint256 coverageAmount;
        uint64 startTs;
        uint64 endTs;
        bytes32 policyRef;
    }

    function allowlistSourceChain(uint64 selector, bool allowed) external;
    function allowlistSender(bytes calldata sender, bool allowed) external;
    function getPolicy(bytes32 policyId) external view returns (Policy memory);
    function ccipReceive(bytes calldata message) external;
    function _ccipReceive(bytes calldata message) external;
}
