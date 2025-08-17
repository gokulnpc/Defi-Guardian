// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IClaimManager {
    struct Claim {
        bytes32 policyId;
        address claimant;
        uint256 amount;
        uint64 startTs;
        uint64 endTs;
        uint64 dstChainSelector;
        bytes dstPayoutVault;
        bool finalized;
        bool approved;
        uint256 yes;
        uint256 no;
    }

    function openClaim(
        bytes32 policyId,
        address claimantOnArbitrum,
        uint256 amountPYUSD,
        uint64 dstChainSelector,
        bytes calldata dstPayoutVault
    ) external;

    function voteYes(uint256 claimId) external;
    function voteNo(uint256 claimId) external;
    function finalizeClaim(uint256 claimId) external payable;
    function claims(uint256 claimId) external view returns (Claim memory);
}
