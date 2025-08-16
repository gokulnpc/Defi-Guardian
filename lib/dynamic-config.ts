import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export const dynamicConfig = {
  environmentId: "3f97aad0-e89c-4696-add7-0b1c9df40b4f",
  walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
  settings: {
    walletList: ["rainbow", "metamask", "coinbase", "walletconnect", "phantom"],
    // Deployed contract addresses on Sepolia
    contracts: {
      LPVault: {
        address: "0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97",
        chainId: 11155111, // Sepolia
      },
      PayoutVault: {
        address: "0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc",
        chainId: 11155111, // Sepolia
      },
      PremiumVault: {
        address: "0xc2fE392C66eD17BA2C388A41fee23Ff4Fd4ba037",
        chainId: 11155111, // Sepolia
      },
    },
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
