# DeFi Guardian - Cross-Chain Data Flow Diagram

## System Overview

The DeFi Guardian system enables cross-chain insurance coverage using Chainlink CCIP for secure message passing between Sepolia and Hedera testnet.

## Architecture Diagram

```mermaid
graph TB
    %% User Interface
    UI[Frontend UI]
    
    %% Sepolia Network
    subgraph Sepolia ["🌐 Sepolia Testnet"]
        PV[PremiumVault<br/>0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499]
        LV[LPVault<br/>0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97]
        PAV[PayoutVault<br/>0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc]
        PYUSD[PYUSD Token<br/>0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9]
        CCIP_Router[CCIP Router<br/>0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59]
    end
    
    %% Hedera Network
    subgraph Hedera ["🌐 Hedera Testnet"]
        PM[PolicyManager<br/>0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569]
        VM[VotingMirror<br/>0xe1C31E56De989192946f096eBA8Ed709C2Ec9003]
        CM[ClaimManager<br/>0x9D4646f64dF7D98c6a83D60a9Af06c67a9eE0215]
    end
    
    %% User Interactions
    UI -->|1. Buy Coverage| PV
    UI -->|2. Quote Fee| PV
    
    %% PremiumVault Operations
    PV -->|3. Transfer PYUSD| PYUSD
    PV -->|4. Split Premium| LV
    PV -->|5. Split Premium| PAV
    PV -->|6. Send CCIP Message| CCIP_Router
    
    %% CCIP Cross-Chain Communication
    CCIP_Router -->|7. Cross-Chain Message| PM
    
    %% PolicyManager Processing
    PM -->|8. Mint Policy NFT| PM
    PM -->|9. Store Policy Data| PM
    
    %% Claims Flow
    UI -->|10. Submit Claim| CM
    CM -->|11. Create Claim| CM
    CM -->|12. Send CCIP Message| CCIP_Router
    CCIP_Router -->|13. Cross-Chain Message| PAV
    
    %% Payout Processing
    PAV -->|14. Process Payout| PAV
    
    %% Styling
    classDef contract fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef router fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef token fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef ui fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    
    class PV,LV,PAV,PM,VM,CM contract
    class CCIP_Router router
    class PYUSD token
    class UI ui
```

## Detailed Data Flow

### 1. Coverage Purchase Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant PV as PremiumVault
    participant PYUSD as PYUSD Token
    participant LV as LPVault
    participant PAV as PayoutVault
    participant CR as CCIP Router
    participant PM as PolicyManager

    U->>UI: Select protocol & coverage
    UI->>PV: quoteCCIPFee()
    PV->>UI: Return fee estimate
    UI->>U: Display fee & premium
    U->>UI: Confirm purchase
    UI->>PV: buyCoverage()
    
    Note over PV: Premium Processing
    PV->>PYUSD: safeTransferFrom(user, vault, amount)
    PV->>LV: safeTransfer(70% of premium)
    PV->>PAV: safeTransfer(30% of premium)
    
    Note over PV: CCIP Message Preparation
    PV->>PV: Build PolicyTerms struct
    PV->>PV: Create EVM2AnyMessage
    PV->>CR: ccipSend{value: fee}()
    
    Note over CR,PM: Cross-Chain Communication
    CR->>PM: _ccipReceive(message)
    
    Note over PM: Policy Processing
    PM->>PM: Validate sender & source chain
    PM->>PM: Decode PolicyTerms
    PM->>PM: Generate policyId
    PM->>PM: Mint NFT to buyer
    PM->>PM: Store policy data
```

### 2. Claims Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant CM as ClaimManager
    participant CR as CCIP Router
    participant PAV as PayoutVault
    participant VM as VotingMirror

    U->>UI: Submit claim
    UI->>CM: openClaim()
    
    Note over CM: Claim Creation
    CM->>CM: Create claim record
    CM->>CM: Start voting period
    
    Note over VM: Voting Process
    VM->>VM: LP holders vote
    VM->>CM: Submit votes
    
    Note over CM: Claim Resolution
    alt Claim Approved
        CM->>CR: ccipSend(payout message)
        CR->>PAV: _ccipReceive(payout)
        PAV->>PAV: Process payout
        PAV->>U: Transfer funds
    else Claim Rejected
        CM->>CM: Mark claim as rejected
    end
```

## Contract Responsibilities

### Sepolia Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **PremiumVault** | `0x8CDBf091e385D0D4A7e8bf7D9AE11d69647bF499` | Main entry point for coverage purchases |
| **LPVault** | `0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97` | Receives 70% of premiums for yield generation |
| **PayoutVault** | `0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc` | Receives 30% of premiums for reserves |
| **PYUSD** | `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` | Payment token for premiums |

### Hedera Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **PolicyManager** | `0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569` | Receives and processes policy registrations |
| **VotingMirror** | `0xe1C31E56De989192946f096eBA8Ed709C2Ec9003` | Handles governance voting for claims |
| **ClaimManager** | `0x9D4646f64dF7D98c6a83D60a9Af06c67a9eE0215` | Manages claim submission and processing |

## Security Checks

### PremiumVault (Sepolia)
- ✅ **Destination Chain Allowlist**: Only Hedera testnet allowed
- ✅ **Receiver Allowlist**: Only PolicyManager address allowed
- ✅ **Gas Limit Validation**: Prevents excessive gas usage

### PolicyManager (Hedera)
- ✅ **Source Chain Allowlist**: Only Sepolia allowed
- ✅ **Sender Allowlist**: Only PremiumVault address allowed
- ✅ **Message Deduplication**: Prevents replay attacks
- ✅ **Reentrancy Protection**: Uses ReentrancyGuard

## Data Structures

### PolicyTerms (Cross-Chain)
```solidity
struct PolicyTerms {
    bytes32 poolId;           // Protocol identifier
    address buyer;            // Coverage buyer
    uint256 coverageAmount;   // Coverage amount in PYUSD
    uint64  startTs;          // Coverage start timestamp
    uint64  endTs;            // Coverage end timestamp
    bytes32 policyRef;        // Policy reference hash
}
```

### Policy (Hedera)
```solidity
struct Policy {
    bytes32 poolId;
    address buyer;
    uint256 coverageAmount;
    uint64  startTs;
    uint64  endTs;
    bytes32 policyRef;
    uint256 tokenId;          // NFT token ID
    bool    active;           // Policy status
}
```

## Key Features

### 🔒 **Security**
- Cross-chain allowlisting
- Message deduplication
- Reentrancy protection
- Gas limit validation

### ⚡ **Efficiency**
- Deterministic policy IDs
- Minimal cross-chain data
- Optimized gas usage

### 🎯 **User Experience**
- Simple coverage purchase
- Transparent fee estimation
- NFT-based policy tracking
- Automated claims processing

## Network Configuration

| Network | Chain ID | Chain Selector | CCIP Router |
|---------|----------|----------------|-------------|
| **Sepolia** | 11155111 | `16015286601757825753` | `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59` |
| **Hedera Testnet** | 296 | `222782988166878823` | Hedera CCIP Router |

## Current Status

- ✅ **PremiumVault**: Fixed and deployed with proper CCIP imports
- ✅ **Cross-Chain Communication**: Working via Chainlink CCIP
- ✅ **Fee Estimation**: Functional (`quoteCCIPFee` returns proper fees)
- ✅ **Frontend Integration**: Updated to use fixed contract
- ⚠️ **PolicyManager Configuration**: Requires manual verification on Hedera
