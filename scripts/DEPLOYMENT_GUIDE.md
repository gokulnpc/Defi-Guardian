# DeFi Guardian - Complete Deployment Guide

This guide provides step-by-step instructions for deploying and configuring the entire DeFi Guardian cross-chain system.

## 📋 Prerequisites

1. **Hardhat Configuration**: Ensure your `hardhat.config.js` has both Sepolia and Hedera networks configured
2. **Environment Variables**: Set up your private key and RPC URLs
3. **Dependencies**: Install all required packages (`@chainlink/contracts-ccip`)

## 🚀 Deployment Process

### Step 1: Deploy Sepolia Contracts

```bash
npx hardhat run scripts/deploy-sepolia-contracts.js --network sepolia
```

**What this does:**
- Deploys `LPVault`, `PayoutVault`, and `PremiumVault`
- Configures basic allowlists and gas limits
- Sets premium split (70% LP, 30% Reserve)
- Saves deployment data to `deployment-sepolia.json`

**Expected Output:**
```
🚀 Deploying Sepolia Contracts...

📋 Deployment Configuration:
=============================
CCIP Router: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59
PYUSD Token: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
Owner: 0xAddc0142a647aE0C1081d202d35D943C4A5c06d2

🔨 Deploying LPVault...
✅ LPVault deployed to: 0x...

🔨 Deploying PayoutVault...
✅ PayoutVault deployed to: 0x...

🔨 Deploying PremiumVault...
✅ PremiumVault deployed to: 0x...

🎉 Sepolia Deployment Complete!
```

### Step 2: Deploy Hedera Contracts

```bash
npx hardhat run scripts/deploy-hedera-contracts.js --network hedera
```

**What this does:**
- Deploys `PolicyManager`, `VotingMirror`, and `ClaimManager`
- Configures basic allowlists and gas limits
- Sets governance parameters (voting period, quorum)
- Saves deployment data to `deployment-hedera.json`

**Expected Output:**
```
🚀 Deploying Hedera Contracts...

📋 Deployment Configuration:
=============================
CCIP Router: 0x0000000000000000000000000000000000000000
Owner: 0xAddc0142a647aE0C1081d202d35D943C4A5c06d2

🔨 Deploying PolicyManager...
✅ PolicyManager deployed to: 0x...

🔨 Deploying VotingMirror...
✅ VotingMirror deployed to: 0x...

🔨 Deploying ClaimManager...
✅ ClaimManager deployed to: 0x...

🎉 Hedera Deployment Complete!
```

### Step 3: Configure Cross-Chain Allowlists

```bash
npx hardhat run scripts/configure-cross-chain-allowlists.js --network sepolia
```

**What this does:**
- Loads deployment data from both networks
- Maps all contracts to their cross-chain counterparts
- Configures allowlists for secure communication
- Tests fee estimation
- Saves final configuration to `cross-chain-config.json`

**Expected Output:**
```
🔗 Configuring Cross-Chain Allowlists...

📋 Configuration Data:
======================
Sepolia Contracts:
  LPVault: 0x...
  PayoutVault: 0x...
  PremiumVault: 0x...

Hedera Contracts:
  PolicyManager: 0x...
  VotingMirror: 0x...
  ClaimManager: 0x...

🔧 Configuring Sepolia Contracts:
✅ PolicyManager receiver updated: 0x...

🔧 Configuring Hedera Contracts:
✅ PremiumVault sender updated: 0x...

🧪 Testing Cross-Chain Communication:
✅ Fee estimation successful: 0.000122 ETH

🎉 Cross-Chain Configuration Complete!
```

## 📊 Contract Architecture

### Sepolia Network
```
PremiumVault (Main Entry Point)
├── LPVault (70% of premiums)
└── PayoutVault (30% of premiums)
```

### Hedera Network
```
PolicyManager (Receives policies)
├── VotingMirror (LP voting power)
└── ClaimManager (Claims processing)
```

### Cross-Chain Communication
```
Sepolia → Hedera:
├── PremiumVault → PolicyManager (Policy registration)
└── LPVault → VotingMirror (LP stake sync)

Hedera → Sepolia:
└── ClaimManager → PayoutVault (Payout instructions)
```

## 🔒 Security Configuration

### Allowlists Configured
- **Source Chain Allowlists**: Only authorized chains can send messages
- **Sender Allowlists**: Only authorized contracts can send messages
- **Receiver Allowlists**: Only authorized contracts can receive messages
- **Gas Limits**: Prevents excessive gas usage

### Cross-Chain Mappings
| Sepolia Contract | Hedera Contract | Direction | Purpose |
|------------------|-----------------|-----------|---------|
| PremiumVault | PolicyManager | Sepolia → Hedera | Policy registration |
| LPVault | VotingMirror | Sepolia → Hedera | LP stake sync |
| PayoutVault | ClaimManager | Hedera → Sepolia | Payout processing |

## 📁 Generated Files

After deployment, you'll have these configuration files:

1. **`deployment-sepolia.json`**: Sepolia contract addresses and configuration
2. **`deployment-hedera.json`**: Hedera contract addresses and configuration
3. **`cross-chain-config.json`**: Complete cross-chain mapping and verification

## 🧪 Testing the Deployment

### 1. Test Fee Estimation
```bash
npx hardhat run scripts/test-fixed-contract.js --network sepolia
```

### 2. Test Cross-Chain Communication
```bash
npx hardhat run scripts/verify-all-contracts.js --network sepolia
```

## 🔧 Troubleshooting

### Common Issues

1. **"Error loading deployment data"**
   - Run deployment scripts in order
   - Check that JSON files were created

2. **"Transaction failed"**
   - Check network configuration
   - Verify signer has sufficient funds
   - Check gas limits

3. **"Allowlist not found"**
   - Ensure contracts are deployed
   - Check contract addresses in JSON files

### Verification Commands

```bash
# Check contract deployment
npx hardhat run scripts/verify-all-contracts.js --network sepolia

# Test fee estimation
npx hardhat run scripts/test-fixed-contract.js --network sepolia

# Check allowlist configuration
npx hardhat run scripts/check-policy-manager-config.js --network sepolia
```

## 📋 Final Configuration

After successful deployment, your system will have:

✅ **6 Contracts Deployed** (3 on each network)
✅ **Cross-Chain Allowlists Configured**
✅ **Gas Limits Set**
✅ **Governance Parameters Configured**
✅ **Fee Estimation Working**
✅ **Security Checks Passing**

## 🎯 Next Steps

1. **Update Frontend**: Update contract addresses in `lib/contracts.ts`
2. **Test Coverage Purchase**: Use the frontend to buy insurance
3. **Test Claims**: Submit and process claims
4. **Monitor**: Watch for cross-chain messages and events

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all prerequisites are met
3. Run verification scripts
4. Check transaction logs for specific errors

The system is now ready for cross-chain insurance operations! 🚀
