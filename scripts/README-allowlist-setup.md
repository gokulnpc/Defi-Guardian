# CCIP Allowlist Setup Guide

This guide explains how to configure cross-chain allowlists for the DeFi Guardian contracts.

## Overview

The DeFi Guardian system uses Chainlink CCIP for cross-chain communication between:
- **Sepolia** (PremiumVault) → **Hedera Testnet** (PolicyManager)

## Fixed Contract

The PremiumVault contract has been fixed and deployed with proper Chainlink CCIP imports:
- **Address**: `0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499`
- **Network**: Sepolia
- **Status**: ✅ Configured and working

## Configuration

The contract is already configured with:
- ✅ Hedera chain selector allowlisted: `222782988166878823`
- ✅ PolicyManager receiver allowlisted: `0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569`
- ✅ Gas limit set: `200000`

## Testing

To test the configuration:

```bash
npx hardhat run scripts/test-fixed-contract.js --network sepolia
```

This will verify that:
- Chain selector is allowlisted
- Gas limit is set
- `quoteCCIPFee` function works correctly

## Available Scripts

- `deploy-fixed-contract.js` - Deploy the fixed PremiumVault contract
- `configure-allowlists.js` - Configure allowlists for both networks
- `test-fixed-contract.js` - Test the fixed contract functionality

## Chain Selectors

- **Sepolia**: `16015286601757825753`
- **Hedera Testnet**: `222782988166878823`

## Contract Addresses

### Sepolia
- PremiumVault: `0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499`
- LPVault: `0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97`
- PayoutVault: `0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc`

### Hedera Testnet
- PolicyManager: `0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569`
- VotingMirror: `0xe1C31E56De989192946f096eBA8Ed709C2Ec9003`
- ClaimManager: `0x9D4646f64dF7D98c6a83D60a9Af06c67a9eE0215`

## Issue Resolution

The original issue with `InvalidExtraArgsTag()` was caused by using custom CCIP interfaces instead of the official Chainlink CCIP library. The fix involved:

1. Installing `@chainlink/contracts-ccip`
2. Using proper imports: `import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol"`
3. Using `Client._argsToBytes()` for proper extraArgs encoding

The contract now works correctly with the CCIP Router and can successfully quote fees and send cross-chain messages.
