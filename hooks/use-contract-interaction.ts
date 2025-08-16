import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useToast } from "@/hooks/use-toast";
import {
  PremiumVaultABI,
  CONTRACT_ADDRESSES,
  type PolicyTerms,
} from "@/lib/contracts";
import { parseEther, formatEther } from "viem";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

export function useContractInteraction() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, primaryWallet } = useDynamicContext();
  const { toast } = useToast();

  // Wagmi hooks for contract interaction
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const buyCoverage = async (
    selectedProtocol: string,
    coverageAmount: string,
    duration: number,
    premium: string
  ) => {
    if (!user || !primaryWallet || !walletClient || !address || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy coverage",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Prepare policy terms with proper types
      const policyTerms = {
        poolId: `0x${selectedProtocol}${Date.now()}` as `0x${string}`,
        buyer: address as `0x${string}`,
        coverageAmount: parseEther(coverageAmount),
        startTs: BigInt(Math.floor(Date.now() / 1000)),
        endTs: BigInt(Math.floor(Date.now() / 1000) + duration * 24 * 60 * 60),
        policyRef: `0x${selectedProtocol}${Date.now()}` as `0x${string}`,
      };

      // CCIP parameters for Hedera
      const dstChainSelector = BigInt("1"); // Hedera chain selector
      const hederaReceiver =
        "0x0000000000000000000000000000000000000000" as `0x${string}`; // Mock Hedera receiver

      // First, let's estimate the CCIP fee
      let ccipFee = BigInt(0);
      try {
        const feeResult = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.PremiumVault as `0x${string}`,
          abi: PremiumVaultABI,
          functionName: "quoteCCIPFee",
          args: [dstChainSelector, hederaReceiver, policyTerms],
        });
        ccipFee = feeResult as bigint;
        console.log("CCIP Fee estimated:", formatEther(ccipFee), "ETH");
      } catch (feeError) {
        console.warn("Could not estimate CCIP fee, using default:", feeError);
        // Use a default fee if estimation fails
        ccipFee = parseEther("0.001"); // 0.001 ETH default
      }

      // Prepare the transaction data
      const data = {
        address: CONTRACT_ADDRESSES.PremiumVault as `0x${string}`,
        abi: PremiumVaultABI,
        functionName: "buyCoverage" as const,
        args: [
          dstChainSelector,
          hederaReceiver,
          policyTerms,
          parseEther(premium),
        ] as const,
        value: ccipFee, // CCIP fee in native token (ETH)
        account: address,
      };

      console.log("Transaction data prepared:", data);

      // Send the transaction
      const hash = await walletClient.writeContract(data);

      console.log("Transaction sent:", hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast({
          title: "Coverage purchased successfully! 🎉",
          description: `Transaction confirmed! Hash: ${hash.slice(
            0,
            10
          )}...${hash.slice(-8)}`,
          variant: "default",
        });

        // Log the successful transaction
        console.log("Transaction successful:", {
          hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          effectiveGasPrice: receipt.effectiveGasPrice,
        });

        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error buying coverage:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific contract errors
        if (errorMessage.includes("insufficient funds")) {
          errorMessage = "Insufficient ETH balance for gas fees and CCIP fee";
        } else if (errorMessage.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (errorMessage.includes("execution reverted")) {
          errorMessage =
            "Contract execution reverted. Check your inputs and contract state.";
        }
      }

      toast({
        title: "Error purchasing coverage",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get CCIP fee estimate
  const getCCIPFeeEstimate = async (
    selectedProtocol: string,
    coverageAmount: string,
    duration: number
  ) => {
    if (!user || !primaryWallet || !publicClient || !address) {
      return "0";
    }

    try {
      const policyTerms = {
        poolId: `0x${selectedProtocol}${Date.now()}` as `0x${string}`,
        buyer: address as `0x${string}`,
        coverageAmount: parseEther(coverageAmount),
        startTs: BigInt(Math.floor(Date.now() / 1000)),
        endTs: BigInt(Math.floor(Date.now() / 1000) + duration * 24 * 60 * 60),
        policyRef: `0x${selectedProtocol}${Date.now()}` as `0x${string}`,
      };

      const dstChainSelector = BigInt("1");
      const hederaReceiver =
        "0x0000000000000000000000000000000000000000" as `0x${string}`;

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PremiumVault as `0x${string}`,
        abi: PremiumVaultABI,
        functionName: "quoteCCIPFee",
        args: [dstChainSelector, hederaReceiver, policyTerms],
      });

      return formatEther(result as bigint);
    } catch (error) {
      console.warn("Could not estimate CCIP fee:", error);
      return "0.001"; // Default fallback
    }
  };

  return {
    buyCoverage,
    getCCIPFeeEstimate,
    isLoading,
    isConnected:
      !!user &&
      !!primaryWallet &&
      !!walletClient &&
      !!address &&
      !!publicClient,
  };
}
