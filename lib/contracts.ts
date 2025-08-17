// PremiumVault ABI for the buyCoverage function
export const PremiumVaultABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_pyusd",
        type: "address",
      },
      {
        internalType: "address",
        name: "_lpVault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_payoutVault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "BadAllocationSum",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
    ],
    name: "DestNotAllowlisted",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
    ],
    name: "NoGasLimitForChain",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "have",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "need",
        type: "uint256",
      },
    ],
    name: "NotEnoughNative",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "receiver",
        type: "bytes",
      },
    ],
    name: "ReceiverNotAllowlisted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAllocation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "dstSelector",
        type: "uint64",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "receiver",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feePaidNative",
        type: "uint256",
      },
    ],
    name: "CCIPSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "DestChainAllowlisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "GasLimitSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "premiumPYUSD",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toLP",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toReserve",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "ccipMessageId",
        type: "bytes32",
      },
    ],
    name: "PremiumPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "receiver",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "ReceiverAllowlisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    name: "RouterUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bpsToLP",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bpsToReserve",
        type: "uint256",
      },
    ],
    name: "SplitUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "lpVault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "payoutVault",
        type: "address",
      },
    ],
    name: "VaultsUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "PYUSD",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "allowlistDestChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "receiver",
        type: "bytes",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "allowlistReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "allowlistedDestChains",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "allowlistedReceivers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
        name: "",
        type: "uint64",
      },
    ],
    name: "gasLimitByChain",
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
  {
    inputs: [],
    name: "lpVault",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "payoutVault",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "premiumBpsToLP",
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
  {
    inputs: [],
    name: "premiumBpsToReserve",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "premiumPYUSD",
        type: "uint256",
      },
    ],
    name: "previewAllocation",
    outputs: [
      {
        internalType: "uint256",
        name: "toLP",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "toReserve",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amt",
        type: "uint256",
      },
    ],
    name: "rescueToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IRouterClient",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "setGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "bpsToLP",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bpsToReserve",
        type: "uint256",
      },
    ],
    name: "setPremiumSplits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
    ],
    name: "setRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpVault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_payoutVault",
        type: "address",
      },
    ],
    name: "setVaults",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

// ClaimManager ABI for claim management functions
export const ClaimManagerABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_votingMirror",
        type: "address",
      },
      {
        internalType: "address",
        name: "_policyManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyFinalized",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyVoted",
    type: "error",
  },
  {
    inputs: [],
    name: "BadParams",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "sel",
        type: "uint64",
      },
    ],
    name: "NoGasLimitForChain",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "sel",
        type: "uint64",
      },
    ],
    name: "NotAllowlistedDest",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "r",
        type: "bytes",
      },
    ],
    name: "NotAllowlistedReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "have",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "need",
        type: "uint256",
      },
    ],
    name: "NotEnoughNative",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPolicyHolder",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "VoteWindowClosed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ClaimFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "policyId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ClaimOpened",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "DestAllowlisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "GasLimitSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "votingPeriodSeconds",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quorumBps",
        type: "uint256",
      },
    ],
    name: "ParamsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "claimant",
        type: "address",
      },
    ],
    name: "PayoutSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "policyManager",
        type: "address",
      },
    ],
    name: "PolicyManagerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "receiver",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "ReceiverAllowlisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    name: "RouterUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "support",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "weight",
        type: "uint256",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "mirror",
        type: "address",
      },
    ],
    name: "VotingMirrorUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "sel",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "allowlistDestChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "r",
        type: "bytes",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "allowlistReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "allowlistedDestChains",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "allowlistedReceivers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claims",
    outputs: [
      {
        internalType: "bytes32",
        name: "policyId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
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
        internalType: "uint64",
        name: "dstChainSelector",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "dstPayoutVault",
        type: "bytes",
      },
      {
        internalType: "bool",
        name: "finalized",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "yes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "no",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
    ],
    name: "finalizeClaim",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "gasLimitByChain",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextClaimId",
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "policyId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "claimantOnArbitrum",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountPYUSD",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "dstChainSelector",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "dstPayoutVault",
        type: "bytes",
      },
    ],
    name: "openClaim",
    outputs: [
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "policyManager",
    outputs: [
      {
        internalType: "contract IPolicyManagerView",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quorumBps",
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
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IRouterClient",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "sel",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "setGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_votingPeriodSeconds",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_quorumBps",
        type: "uint256",
      },
    ],
    name: "setParams",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "p",
        type: "address",
      },
    ],
    name: "setPolicyManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
    ],
    name: "setRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "m",
        type: "address",
      },
    ],
    name: "setVotingMirror",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
    ],
    name: "voteNo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
    ],
    name: "voteYes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "votingMirror",
    outputs: [
      {
        internalType: "contract IVotingMirror",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "votingPeriodSeconds",
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
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

// VotingMirror ABI for voting power functions
export const VotingMirrorABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
    ],
    name: "MessageAlreadyProcessed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "sel",
        type: "uint64",
      },
    ],
    name: "NotAllowlistedChain",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "sender",
        type: "bytes",
      },
    ],
    name: "NotAllowlistedSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "lp",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "power",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalPower",
        type: "uint256",
      },
    ],
    name: "PowerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "sender",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "SenderAllowlisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "SourceChainAllowlisted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "sender",
        type: "bytes",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "allowlistSender",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "selector",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "allowlistSourceChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "allowlistedSenders",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "allowlistedSourceChains",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "processedMessages",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IRouterClient",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPower",
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
  {
    inputs: [],
    name: "totalPowerCached",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "vPower",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "lp",
        type: "address",
      },
    ],
    name: "vPowerOf",
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
  // Sepolia contracts
  LPVault: "0xEC1f7B099c0a984badF83222aeb61f1e4cd7dB97",
  PayoutVault: "0x6f5421f96786F69609b3f2d15A268A5c4cbD6dEc",
  PremiumVault: "0xc2fE392C66eD17BA2C388A41fee23Ff4Fd4ba037",

  // Hedera Testnet contracts
  PolicyManager: "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569",
  VotingMirror: "0xe1C31E56De989192946f096eBA8Ed709C2Ec9003",
  ClaimManager: "0x9D4646f64dF7D98c6a83D60a9Af06c67a9eE0215",
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

// Types for ClaimManager
export interface Claim {
  policyId: string;
  claimant: string;
  amount: bigint;
  startTs: bigint;
  endTs: bigint;
  dstChainSelector: bigint;
  dstPayoutVault: string;
  finalized: boolean;
  approved: boolean;
  yes: bigint;
  no: bigint;
}

// Chain selectors
export const CHAIN_SELECTORS = {
  HEDERA_TESTNET: BigInt("222782988166878823"),
  SEPOLIA: BigInt("16015286601757825753"),
} as const;

export interface OpenClaimParams {
  policyId: string;
  claimantOnArbitrum: string;
  amountPYUSD: string;
  dstChainSelector?: bigint;
  dstPayoutVault?: string;
}
