// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPremiumVault {
    struct PolicyTerms {
        bytes32 poolId;
        uint256 coverageAmount;
        uint64 startTs;
        uint64 endTs;
        bytes32 policyRef;
    }

    function buyCoverage(
        uint64 dstChainSelector,
        bytes calldata hederaReceiver,
        PolicyTerms calldata terms,
        uint256 premiumPYUSD
    ) external payable returns (bytes32);

    function previewAllocation(uint256 premiumPYUSD) external view returns (uint256 toLP, uint256 toReserve);
    function quoteCCIPFee(uint64 dstChainSelector, bytes calldata hederaReceiver, PolicyTerms calldata terms) external view returns (uint256);
}
