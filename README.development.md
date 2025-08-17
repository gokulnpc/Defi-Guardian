# DeFi Guardians - Development Guide

This project contains both a Next.js frontend application and Hardhat smart contract development environment.

## Frontend Development

The main `package.json` contains only frontend dependencies for clean Vercel deployments.

### Commands:

```bash
# Install frontend dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Smart Contract Development

For blockchain development, use the Hardhat configuration:

### Setup:

```bash
# Copy Hardhat package.json
cp package.hardhat.json package.json

# Install Hardhat dependencies
pnpm install

# Create .env file with your keys
cp .env.example .env
```

### Commands:

```bash
# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to Sepolia
pnpm deploy:sepolia

# Configure Sepolia contracts
pnpm configure:sepolia

# Configure Hedera contracts
pnpm configure:hedera

# Start local Hardhat node
pnpm node

# Clean artifacts
pnpm clean
```

### Environment Variables for Hardhat:

```
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
REPORT_GAS=true
```

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility libraries
├── hooks/              # Custom React hooks
├── contracts/          # Solidity smart contracts
├── scripts/            # Hardhat deployment scripts
├── hardhat.config.js   # Hardhat configuration
├── package.json        # Frontend dependencies
└── package.hardhat.json # Hardhat dependencies
```

## Deployment

- **Frontend**: Automatically deployed to Vercel using main `package.json`
- **Contracts**: Deploy using Hardhat commands with `package.hardhat.json`

## Switching Configurations

### To Frontend Mode:

```bash
git checkout package.json  # Reset to frontend config
pnpm install
```

### To Hardhat Mode:

```bash
cp package.hardhat.json package.json
pnpm install
```
