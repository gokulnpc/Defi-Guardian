"use client";

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { ReactNode } from "react";

interface DynamicProviderProps {
  children: ReactNode;
}

export function DynamicProvider({ children }: DynamicProviderProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "3f97aad0-e89c-4696-add7-0b1c9df40b4f",
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
      }}
    >
      {children}
      <DynamicWidget />
    </DynamicContextProvider>
  );
}
