import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useToast } from "@/hooks/use-toast";
import {
  PremiumVaultABI,
  ClaimManagerABI,
  VotingMirrorABI,
  CONTRACT_ADDRESSES,
  CHAIN_SELECTORS,
  type PolicyTerms,
} from "@/lib/contracts";

// PYUSD Token ABI (ERC20 with approve function)
const PYUSD_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
import { parseEther, formatEther, formatUnits, parseUnits } from "viem";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";

// Helper function to generate proper 32-byte values
function generate32ByteValue(prefix: string, timestamp: number): `0x${string}` {
  // For 32 bytes, we need 64 hex characters total
  // We'll use a hash-based approach to ensure proper hex encoding
  const timestampHex = timestamp.toString(16).padStart(16, "0");

  // Create a deterministic but unique identifier
  // Use the prefix length + timestamp to create a unique value
  const prefixHash = prefix.length.toString(16).padStart(8, "0");
  const uniqueId = (timestamp % 1000000).toString(16).padStart(8, "0");
  const padding = "0".repeat(32); // 32 chars to fill remaining space

  const value = `0x${prefixHash}${uniqueId}${timestampHex}${padding}`;

  // Debug logging
  console.log(`generate32ByteValue debug:`);
  console.log(`  prefix: "${prefix}"`);
  console.log(`  prefixHash: "${prefixHash}" (length: ${prefixHash.length})`);
  console.log(`  uniqueId: "${uniqueId}" (length: ${uniqueId.length})`);
  console.log(`  timestamp: ${timestamp}`);
  console.log(
    `  timestampHex: "${timestampHex}" (length: ${timestampHex.length})`
  );
  console.log(`  padding: "${padding}" (length: ${padding.length})`);
  console.log(`  final value: "${value}" (length: ${value.length})`);

  // Validate that it's exactly 32 bytes (64 hex chars + 0x prefix = 66 chars total)
  if (value.length !== 66) {
    throw new Error(
      `Generated value length ${value.length} is not 66 characters (32 bytes). Expected 66, got ${value.length}`
    );
  }

  // Additional validation: ensure the value is valid hex
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error(`Generated value is not valid hex: ${value}`);
  }

  return value as `0x${string}`;
}

// Use contract addresses from contracts.ts
const HEDERA_CONTRACT_ADDRESSES = {
  PolicyManager: CONTRACT_ADDRESSES.PolicyManager,
  VotingMirror: CONTRACT_ADDRESSES.VotingMirror,
  ClaimManager: CONTRACT_ADDRESSES.ClaimManager,
} as const;

const SEPOLIA_CONTRACT_ADDRESSES = {
  LPVault: CONTRACT_ADDRESSES.LPVault,
  PayoutVault: CONTRACT_ADDRESSES.PayoutVault,
  PremiumVault: CONTRACT_ADDRESSES.PremiumVault,
  PYUSD: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9", // Sepolia PYUSD token address
} as const;

export function useContractInteraction() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, primaryWallet } = useDynamicContext();
  const { toast } = useToast();

  // Wagmi hooks for contract interaction
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Function to buy coverage through PremiumVault on Sepolia
  const buyCoverage = async (
    selectedProtocol: string,
    coverageAmount: string,
    duration: number,
    premium: string,
    onSuccess?: (hash: string) => void
  ) => {
    // Validate inputs
    if (!selectedProtocol || selectedProtocol.trim() === "") {
      toast({
        title: "Invalid Protocol",
        description: "Please select a valid protocol",
        variant: "destructive",
      });
      return false;
    }

    if (duration <= 0 || duration > 365) {
      toast({
        title: "Invalid Duration",
        description: "Duration must be between 1 and 365 days",
        variant: "destructive",
      });
      return false;
    }
    if (!user || !primaryWallet || !walletClient || !address || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy coverage",
        variant: "destructive",
      });
      return false;
    }    


    // Check if user is on Sepolia network
    try {
      const chainId = await publicClient.getChainId();
      if (chainId !== 11155111) {
        // Sepolia chain ID
        toast({
          title: "Wrong Network",
          description:
            "Please switch to Sepolia network to interact with this contract. You can do this in your wallet settings.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.warn("Could not check chain ID:", error);
      // Continue anyway, but this might cause issues
    }

    try {
      setIsLoading(true);
      // Generate proper 32-byte values for poolId and policyRef
      const timestamp = Date.now();
      const poolId = generate32ByteValue(selectedProtocol, timestamp);
      const policyRef = generate32ByteValue(selectedProtocol, timestamp);

      console.log("Generated poolId:", poolId, "length:", poolId.length);
      console.log(
        "Generated policyRef:",
        policyRef,
        "length:",
        policyRef.length
      );

      // Calculate timestamps with proper BigInt arithmetic
      const startTs = BigInt(Math.floor(timestamp / 1000));
      const durationSeconds =
        BigInt(duration) * BigInt(24) * BigInt(60) * BigInt(60);
      const endTs = startTs + durationSeconds;

      console.log("Timestamp calculations:");
      console.log("  timestamp:", timestamp);
      console.log("  startTs:", startTs.toString());
      console.log("  duration (days):", duration);
      console.log("  durationSeconds:", durationSeconds.toString());
      console.log("  endTs:", endTs.toString());

      const policyTerms = {
        poolId,
        buyer: address as `0x${string}`,
        coverageAmount: parseEther(coverageAmount),
        startTs,
        endTs,
        policyRef,
      };
      console.log("policyTerms", policyTerms);
      // CCIP parameters for Hedera
      const dstChainSelector = CHAIN_SELECTORS.HEDERA_TESTNET;
      const hederaReceiver = `0x000000000000000000000000d1b6bea5a3b3dd4836100f5c55877c59d4666569` as `0x${string}`;
      console.log("hederaReceiver", hederaReceiver);
      console.log("dstChainSelector", dstChainSelector);
      // First, let's estimate the CCIP fee
      let ccipFee = BigInt(0);
      try {
        console.log("Estimating CCIP fee with parameters:");
        console.log("  dstChainSelector:", dstChainSelector.toString());
        console.log("  hederaReceiver:", hederaReceiver);
        console.log("  policyTerms:", policyTerms);
        
        const feeResult = await publicClient.readContract({
          address: SEPOLIA_CONTRACT_ADDRESSES.PremiumVault as `0x${string}`,
          abi: PremiumVaultABI,
          functionName: "quoteCCIPFee",
          args: [dstChainSelector, hederaReceiver, policyTerms],
        });
        ccipFee = feeResult as bigint;
        console.log("CCIP Fee estimated:", formatEther(ccipFee), "ETH");
      } catch (feeError) {
        console.error("Could not estimate CCIP fee:", feeError);
        console.error("This might be due to:");
        console.error("1. Hedera chain selector not allowlisted");
        console.error("2. PolicyManager receiver not allowlisted");
        console.error("3. Gas limit not set for Hedera chain");
        console.error("4. Contract configuration issues");
        
        // Use a default fee if estimation fails
        ccipFee = parseEther("0.001"); // 0.001 ETH default
        console.log("Using default CCIP fee:", formatEther(ccipFee), "ETH");
      }

      // Prepare the transaction data
      const data = {
        address: SEPOLIA_CONTRACT_ADDRESSES.PremiumVault as `0x${string}`,
        abi: PremiumVaultABI,
        functionName: "buyCoverage" as const,
        args: [
          dstChainSelector,
          hederaReceiver,
          policyTerms,
          parseUnits(premium, 6), // PYUSD has 6 decimals
        ] as const,
        value: ccipFee, // CCIP fee in native token (ETH)
        account: address,
      };

      // Check PYUSD balance and allowance before sending transaction
      try {
        const pyusdBalance = await publicClient.readContract({
          address: SEPOLIA_CONTRACT_ADDRESSES.PYUSD as `0x${string}`,
          abi: PYUSD_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });
        
        const pyusdAllowance = await publicClient.readContract({
          address: SEPOLIA_CONTRACT_ADDRESSES.PYUSD as `0x${string}`,
          abi: PYUSD_ABI,
          functionName: "allowance",
          args: [address as `0x${string}`, SEPOLIA_CONTRACT_ADDRESSES.PremiumVault as `0x${string}`],
        });
        
        const requiredAmount = parseUnits(premium, 6); // PYUSD has 6 decimals
        
        console.log("PYUSD Check:");
        console.log("  Balance:", formatUnits(pyusdBalance as bigint, 6), "PYUSD");
        console.log("  Allowance:", formatUnits(pyusdAllowance as bigint, 6), "PYUSD");
        console.log("  Required:", formatUnits(requiredAmount, 6), "PYUSD");
        console.log("  Balance sufficient:", (pyusdBalance as bigint) >= requiredAmount);
        console.log("  Allowance sufficient:", (pyusdAllowance as bigint) >= requiredAmount);
        
        if ((pyusdBalance as bigint) < requiredAmount) {
          throw new Error(`Insufficient PYUSD balance. Have: ${formatUnits(pyusdBalance as bigint, 6)}, Need: ${formatUnits(requiredAmount, 6)}`);
        }
        
        if ((pyusdAllowance as bigint) < requiredAmount) {
          throw new Error(`Insufficient PYUSD allowance. Have: ${formatUnits(pyusdAllowance as bigint, 6)}, Need: ${formatUnits(requiredAmount, 6)}`);
        }
        
        // Check ETH balance for gas fees and CCIP fee
        const ethBalance = await publicClient.getBalance({ address: address as `0x${string}` });
        const estimatedGasFee = parseEther("0.01"); // Conservative estimate for gas
        const totalRequiredEth = ccipFee + estimatedGasFee;
        
        console.log("ETH Check:");
        console.log("  Balance:", formatEther(ethBalance), "ETH");
        console.log("  CCIP Fee:", formatEther(ccipFee), "ETH");
        console.log("  Estimated Gas:", formatEther(estimatedGasFee), "ETH");
        console.log("  Total Required:", formatEther(totalRequiredEth), "ETH");
        console.log("  Balance sufficient:", ethBalance >= totalRequiredEth);
        
        if (ethBalance < totalRequiredEth) {
          throw new Error(`Insufficient ETH balance. Have: ${formatEther(ethBalance)}, Need: ${formatEther(totalRequiredEth)} (CCIP: ${formatEther(ccipFee)} + Gas: ~${formatEther(estimatedGasFee)})`);
        }
      } catch (balanceError) {
        console.error("Error checking balances:", balanceError);
        throw balanceError;
      }

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

        // Call success callback with transaction hash
        if (onSuccess) {
          onSuccess(hash);
        }

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
    // Validate inputs
    if (
      !selectedProtocol ||
      selectedProtocol.trim() === "" ||
      duration <= 0 ||
      duration > 365
    ) {
      return "0";
    }

    if (!user || !primaryWallet || !publicClient || !address) {
      return "0";
    }

    // Check if user is on Sepolia network
    try {
      const chainId = await publicClient.getChainId();
      if (chainId !== 11155111) {
        // Sepolia chain ID
        console.warn("User not on Sepolia network, chain ID:", chainId);
        return "0";
      }
    } catch (error) {
      console.warn("Could not check chain ID:", error);
      return "0";
    }

    try {
      // Generate proper 32-byte values for poolId and policyRef
      const timestamp = Date.now();
      const poolId = generate32ByteValue(selectedProtocol, timestamp);
      const policyRef = generate32ByteValue(selectedProtocol, timestamp);

      console.log("Fee estimate - poolId:", poolId, "length:", poolId.length);
      console.log(
        "Fee estimate - policyRef:",
        policyRef,
        "length:",
        policyRef.length
      );

      // Calculate timestamps with proper BigInt arithmetic
      const startTs = BigInt(Math.floor(timestamp / 1000));
      const durationSeconds =
        BigInt(duration) * BigInt(24) * BigInt(60) * BigInt(60);
      const endTs = startTs + durationSeconds;

      console.log("Fee estimate - Timestamp calculations:");
      console.log("  timestamp:", timestamp);
      console.log("  startTs:", startTs.toString());
      console.log("  duration (days):", duration);
      console.log("  durationSeconds:", durationSeconds.toString());
      console.log("  endTs:", endTs.toString());

      const policyTerms = {
        poolId,
        buyer: address as `0x${string}`,
        coverageAmount: parseEther(coverageAmount),
        startTs,
        endTs,
        policyRef,
      };

      const dstChainSelector = CHAIN_SELECTORS.HEDERA_TESTNET;
      const hederaReceiver = `0x000000000000000000000000d1b6bea5a3b3dd4836100f5c55877c59d4666569` as `0x${string}`;
      console.log("publicClient", await publicClient.getChainId());
      const result = await publicClient.readContract({
        address: SEPOLIA_CONTRACT_ADDRESSES.PremiumVault as `0x${string}`,
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

  // Function to open a claim on Hedera ClaimManager
  const openClaim = async (
    policyId: string,
    claimantOnArbitrum: string,
    amountPYUSD: string,
    dstChainSelector: bigint = CHAIN_SELECTORS.SEPOLIA,
    dstPayoutVault: string = SEPOLIA_CONTRACT_ADDRESSES.PayoutVault,
    onSuccess?: (hash: string) => void
  ) => {
    if (!user || !primaryWallet || !walletClient || !address || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to open a claim",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Encode the dstPayoutVault address
      const encodedPayoutVault = `0x${dstPayoutVault.slice(
        2
      )}` as `0x${string}`;

      // Prepare the transaction data for ClaimManager
      const data = {
        address: HEDERA_CONTRACT_ADDRESSES.ClaimManager as `0x${string}`,
        abi: ClaimManagerABI,
        functionName: "openClaim" as const,
        args: [
          policyId as `0x${string}`,
          claimantOnArbitrum as `0x${string}`,
          parseEther(amountPYUSD),
          dstChainSelector,
          encodedPayoutVault,
        ] as const,
        account: address,
      };

      console.log("Opening claim with data:", data);

      // Send the transaction
      const hash = await walletClient.writeContract(data);

      console.log("Claim opened:", hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast({
          title: "Claim opened successfully! 📋",
          description: `Claim opened! Hash: ${hash.slice(0, 10)}...${hash.slice(
            -8
          )}`,
          variant: "default",
        });

        // Call success callback with transaction hash
        if (onSuccess) {
          onSuccess(hash);
        }

        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error opening claim:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error opening claim",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to vote on a claim
  const voteOnClaim = async (
    claimId: bigint, 
    support: boolean,
    onSuccess?: (hash: string) => void
  ) => {
    if (!user || !primaryWallet || !walletClient || !address || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      const functionName = support ? "voteYes" : "voteNo";

      const data = {
        address: HEDERA_CONTRACT_ADDRESSES.ClaimManager as `0x${string}`,
        abi: ClaimManagerABI,
        functionName: functionName as "voteYes" | "voteNo",
        args: [claimId] as const,
        account: address,
      };

      console.log(`Voting ${support ? "YES" : "NO"} on claim:`, data);

      // Send the transaction
      const hash = await walletClient.writeContract(data);

      console.log("Vote submitted:", hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast({
          title: `Vote submitted successfully! ${support ? "✅" : "❌"}`,
          description: `Vote recorded! Hash: ${hash.slice(
            0,
            10
          )}...${hash.slice(-8)}`,
          variant: "default",
        });

        // Call success callback with transaction hash
        if (onSuccess) {
          onSuccess(hash);
        }

        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error voting on claim:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error voting on claim",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to finalize a claim
  const finalizeClaim = async (
    claimId: bigint,
    onSuccess?: (hash: string) => void
  ) => {
    if (!user || !primaryWallet || !walletClient || !address || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to finalize claim",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Estimate gas for finalization
      const gasEstimate = await publicClient.estimateGas({
        account: address,
        to: HEDERA_CONTRACT_ADDRESSES.ClaimManager as `0x${string}`,
        data: "0x", // Will be set by the contract call
      });

      const data = {
        address: HEDERA_CONTRACT_ADDRESSES.ClaimManager as `0x${string}`,
        abi: ClaimManagerABI,
        functionName: "finalizeClaim" as const,
        args: [claimId] as const,
        account: address,
        value: gasEstimate, // Include some ETH for CCIP fees
      };

      console.log("Finalizing claim:", data);

      // Send the transaction
      const hash = await walletClient.writeContract(data);

      console.log("Claim finalized:", hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast({
          title: "Claim finalized successfully! 🎯",
          description: `Claim finalized! Hash: ${hash.slice(
            0,
            10
          )}...${hash.slice(-8)}`,
          variant: "default",
        });

        // Call success callback with transaction hash
        if (onSuccess) {
          onSuccess(hash);
        }

        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error finalizing claim:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error finalizing claim",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get voting power from VotingMirror
  const getVotingPower = async (userAddress?: string) => {
    if (!publicClient) return "0";

    try {
      const addressToCheck = userAddress || address;
      if (!addressToCheck) return "0";

      const result = await publicClient.readContract({
        address: HEDERA_CONTRACT_ADDRESSES.VotingMirror as `0x${string}`,
        abi: VotingMirrorABI,
        functionName: "vPowerOf",
        args: [addressToCheck as `0x${string}`],
      });

      return formatEther(result as bigint);
    } catch (error) {
      console.warn("Could not get voting power:", error);
      return "0";
    }
  };

  // Function to get total voting power
  const getTotalVotingPower = async () => {
    if (!publicClient) return "0";

    try {
      const result = await publicClient.readContract({
        address: HEDERA_CONTRACT_ADDRESSES.VotingMirror as `0x${string}`,
        abi: VotingMirrorABI,
        functionName: "totalPower",
        args: [],
      });

      return formatEther(result as bigint);
    } catch (error) {
      console.warn("Could not get total voting power:", error);
      return "0";
    }
  };

  // Function to approve PYUSD spending
  const approvePYUSD = async (
    amount: string,
    onSuccess?: (hash: string) => void
  ) => {
    if (!user || !primaryWallet || !walletClient || !address || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve PYUSD",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Check if user is on Sepolia network
      const chainId = await publicClient.getChainId();
      if (chainId !== 11155111) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Sepolia network to approve PYUSD",
          variant: "destructive",
        });
        return false;
      }

      const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals
      const spenderAddress = SEPOLIA_CONTRACT_ADDRESSES.PremiumVault as `0x${string}`;

      // Check current allowance
      const currentAllowance = await publicClient.readContract({
        address: SEPOLIA_CONTRACT_ADDRESSES.PYUSD as `0x${string}`,
        abi: PYUSD_ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, spenderAddress],
      });

      console.log("PYUSD Approval Check:");
      console.log("  Amount to approve:", formatUnits(amountWei, 6), "PYUSD");
      console.log("  Current allowance:", formatUnits(currentAllowance as bigint, 6), "PYUSD");

      // If allowance is sufficient, no need to approve
      if ((currentAllowance as bigint) >= amountWei) {
        toast({
          title: "Already Approved",
          description: "You already have sufficient PYUSD allowance",
          variant: "default",
        });
        return true;
      }

      // Send approval transaction
      const hash = await walletClient.writeContract({
        address: SEPOLIA_CONTRACT_ADDRESSES.PYUSD as `0x${string}`,
        abi: PYUSD_ABI,
        functionName: "approve",
        args: [spenderAddress, amountWei],
      });

      toast({
        title: "Approval Transaction Sent",
        description: `Waiting for confirmation... Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
        variant: "default",
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast({
          title: "PYUSD Approved Successfully! ✅",
          description: `Approval confirmed! Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
          variant: "default",
        });

        // Call success callback with transaction hash
        if (onSuccess) {
          onSuccess(hash);
        }

        return true;
      } else {
        throw new Error("Approval transaction failed");
      }
    } catch (error) {
      console.error("Error approving PYUSD:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buyCoverage,
    approvePYUSD,
    getCCIPFeeEstimate,
    openClaim,
    voteOnClaim,
    finalizeClaim,
    getVotingPower,
    getTotalVotingPower,
    isLoading,
    isConnected:
      !!user &&
      !!primaryWallet &&
      !!walletClient &&
      !!address &&
      !!publicClient,
    // Contract addresses for reference
    contractAddresses: {
      hedera: HEDERA_CONTRACT_ADDRESSES,
      sepolia: SEPOLIA_CONTRACT_ADDRESSES,
    },
  };
}
