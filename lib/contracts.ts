// PremiumVault ABI for the buyCoverage function
export const PremiumVaultABI = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "dstChainSelector",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "hederaReceiver",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "poolId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "buyer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "coverageAmount",
            type: "uint256",
          },
          {
            internalType: "uint64",
            name: "startTs",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "endTs",
            type: "uint64",
          },
          {
            internalType: "bytes32",
            name: "policyRef",
            type: "bytes32",
          },
        ],
        internalType: "struct PremiumVault.PolicyTerms",
        name: "terms",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "premiumPYUSD",
        type: "uint256",
      },
    ],
    name: "buyCoverage",
    outputs: [
      {
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "dstChainSelector",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "hederaReceiver",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "poolId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "buyer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "coverageAmount",
            type: "uint256",
          },
          {
            internalType: "uint64",
            name: "startTs",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "endTs",
            type: "uint64",
          },
          {
            internalType: "bytes32",
            name: "policyRef",
            type: "bytes32",
          },
        ],
        internalType: "struct PremiumVault.PolicyTerms",
        name: "terms",
        type: "tuple",
      },
    ],
    name: "quoteCCIPFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Contract addresses
export const CONTRACT_ADDRESSES = {
  LPVault: "0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97",
  PayoutVault: "0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc",
  PremiumVault: "0xc2fE392C66eD17BA2C388A41fee23Ff4Fd4ba037",
} as const;

// Types for the buyCoverage function
export interface PolicyTerms {
  poolId: string;
  buyer: string;
  coverageAmount: bigint;
  startTs: bigint;
  endTs: bigint;
  policyRef: string;
}

export interface BuyCoverageParams {
  dstChainSelector: bigint;
  hederaReceiver: string;
  terms: PolicyTerms;
  premiumPYUSD: bigint;
}
