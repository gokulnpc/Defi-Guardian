"use client";

import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

// Helper function to format wallet address
const formatAddress = (address: string) => {
  if (!address) return "Connected";
  if (address.length <= 10) return address;

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function ConnectWalletButton() {
  const { user, setShowAuthFlow, handleLogOut, primaryWallet } =
    useDynamicContext();

  if (!user) {
    return (
      <Button
        onClick={() => setShowAuthFlow(true)}
        className="bg-cyan-600 hover:bg-cyan-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  const address = primaryWallet?.address || "Connected";
  const formattedAddress = formatAddress(address);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-cyan-200 bg-transparent">
          <Wallet className="w-4 h-4 mr-2" />
          {formattedAddress}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View on Explorer</DropdownMenuItem>
        <DropdownMenuItem>Copy Address</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut}>Disconnect</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
