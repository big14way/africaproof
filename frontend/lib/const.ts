// AfricanProof Contract Addresses (Update after deployment)
export const AFRICAN_PROOF_CONTRACTS = {
  // Base Mainnet
  base: {
    ProductionAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
    SimpleAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
  },
  // Base Sepolia (Testnet)
  baseSepolia: {
    ProductionAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
    SimpleAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
  },
  // Local development
  localhost: {
    ProductionAfricanProof: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    SimpleAfricanProof: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  }
};

// Legacy registry for backward compatibility
// AfricanProof Contract Addresses (Update after deployment)
export const AFRICAN_PROOF_CONTRACTS = {
  // Base Mainnet
  base: {
    ProductionAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
    SimpleAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
  },
  // Base Sepolia (Testnet)
  baseSepolia: {
    ProductionAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
    SimpleAfricanProof: "0x0000000000000000000000000000000000000000", // Update after deployment
  },
  // Local development
  localhost: {
    ProductionAfricanProof: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    SimpleAfricanProof: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  }
};

// Legacy registry for backward compatibility
export const registry = {
  GHA: "0xb40eb0c9edd1ccf5305dccf7da92291f8059d947",
  NGA: "0xc3a4eb979e9035486b54fe8b57d36aef9519eac6",
  KEN: "0x7b923b2948f41993c194ec8f761fb2ee294a55fa",
  ZAF: "0xf9d7abb40ff5943b0bb53d584e72dafc7a5c79db",
};

// African countries configuration
export const AFRICAN_COUNTRIES = {
  GHA: { name: "Ghana", flag: "🇬🇭", code: "GHA" },
  NGA: { name: "Nigeria", flag: "🇳🇬", code: "NGA" },
  KEN: { name: "Kenya", flag: "🇰🇪", code: "KEN" },
  ZAF: { name: "South Africa", flag: "🇿🇦", code: "ZAF" },
  EGY: { name: "Egypt", flag: "🇪🇬", code: "EGY" },
  MAR: { name: "Morocco", flag: "🇲🇦", code: "MAR" },
  TUN: { name: "Tunisia", flag: "🇹🇳", code: "TUN" },
  ETH: { name: "Ethiopia", flag: "🇪🇹", code: "ETH" },
};

// Base ENS name
export const BASE_ENS_NAME = "gwill.eth";

// African countries configuration
export const AFRICAN_COUNTRIES = {
  GHA: { name: "Ghana", flag: "🇬🇭", code: "GHA" },
  NGA: { name: "Nigeria", flag: "🇳🇬", code: "NGA" },
  KEN: { name: "Kenya", flag: "🇰🇪", code: "KEN" },
  ZAF: { name: "South Africa", flag: "🇿🇦", code: "ZAF" },
  EGY: { name: "Egypt", flag: "🇪🇬", code: "EGY" },
  MAR: { name: "Morocco", flag: "🇲🇦", code: "MAR" },
  TUN: { name: "Tunisia", flag: "🇹🇳", code: "TUN" },
  ETH: { name: "Ethiopia", flag: "🇪🇹", code: "ETH" },
};

// Base ENS name
export const BASE_ENS_NAME = "gwill.eth";

export const available = [
  {
    inputs: [
      {
        internalType: "string",
        name: "label",
        type: "string",
      },
      {
        internalType: "address",
        name: "_registry",
        type: "address",
      },
    ],
    name: "available",
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
];

export const SelfRegistrar = "0x981FEd4eeFfbaFe19F71FFa832CF862a4b9dc5F6";

export const Example = "0xd3d0f083d602Bbba73e36b9Bf90c0E39C9541EeB";

export const ExampleABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_latAmProof",
        type: "address",
      },
      {
        internalType: "address",
        name: "_reliefToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    name: "ProgramStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ReliefClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "funder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
    ],
    name: "ReliefFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxClaims",
        type: "uint256",
      },
    ],
    name: "ReliefProgramCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "checkEligibility",
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
        name: "programId",
        type: "uint256",
      },
    ],
    name: "claimRelief",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "claims",
    outputs: [
      {
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "claimed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxClaims",
        type: "uint256",
      },
    ],
    name: "createProgram",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "fundRelief",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getClaim",
    outputs: [
      {
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "programId_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "claimed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
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
        name: "programId",
        type: "uint256",
      },
    ],
    name: "getProgram",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxClaims",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalClaimed",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endDate",
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
        name: "programId",
        type: "uint256",
      },
    ],
    name: "getRemainingClaims",
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
    name: "getTokenAddress",
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
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserClaims",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latAmProof",
    outputs: [
      {
        internalType: "contract ILatAmProof",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "programCount",
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
    ],
    name: "programs",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxClaims",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalClaimed",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reliefToken",
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
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    name: "setProgramStatus",
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
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userClaims",
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
];
