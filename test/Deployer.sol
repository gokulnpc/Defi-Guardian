// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {PremiumVault} from "../contracts/PremiumVault.sol";
import {LPVault} from "../contracts/LPVault.sol";
import {PayoutVault} from "../contracts/PayoutVault.sol";
import {PolicyManager} from "../contracts/PolicyManager.sol";
import {VotingMirror} from "../contracts/VotingMirror.sol";
import {ClaimManager} from "../contracts/ClaimManager.sol";

contract Deployer {
    function deployAll(
        address ccipRouter,
        address pyusdToken,
        address owner
    ) external returns (
        address premiumVault,
        address lpVault,
        address payoutVault,
        address policyManager,
        address votingMirror,
        address claimManager
    ) {
        // Deploy Arbitrum contracts (need to deploy in order due to dependencies)
        lpVault = address(new LPVault(pyusdToken, ccipRouter, owner));
        payoutVault = address(new PayoutVault(ccipRouter, pyusdToken, owner));
        premiumVault = address(new PremiumVault(ccipRouter, pyusdToken, lpVault, payoutVault, owner));

        // Deploy Hedera contracts
        policyManager = address(new PolicyManager(ccipRouter, owner));
        votingMirror = address(new VotingMirror(ccipRouter, owner));
        claimManager = address(new ClaimManager(ccipRouter, votingMirror, policyManager, owner));

        return (premiumVault, lpVault, payoutVault, policyManager, votingMirror, claimManager);
    }
}
