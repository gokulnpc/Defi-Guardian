import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export const dynamicConfig = {
  environmentId: "3f97aad0-e89c-4696-add7-0b1c9df40b4f",
  walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
  settings: {
    walletList: ["rainbow", "metamask", "coinbase", "walletconnect", "phantom"],
    networks: [
      {
        chainId: 11155111, // Sepolia testnet
        chainName: "Sepolia",
        name: "Sepolia",
        networkId: 11155111,
        nativeCurrency: {
          name: "Sepolia Ether",
          symbol: "SEP",
          decimals: 18,
        },
        rpcUrls: ["https://rpc.sepolia.org"],
        blockExplorerUrls: ["https://sepolia.etherscan.io"],
        iconUrls: [
          "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.png",
        ],
      },
    ],
    eventsCallbacks: {
      onAuthSuccess: (args: any) => {
        console.log("Auth success:", args);
      },
      onAuthError: (args: any) => {
        console.error("Auth error:", args);
      },
      onUserProfileUpdate: (args: any) => {
        console.log("User profile update:", args);
      },
    },
  },
};
