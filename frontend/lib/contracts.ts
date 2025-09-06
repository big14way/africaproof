// Contract addresses and configuration for AfricanProof
export const CONTRACTS = {
  // Core identity and payment contract
  AFRICAN_PROOF: "0xBC358610EC9d2232b6837018A328b54E9D72cB26",
  
  // ENS L2 subdomain management
  DURIN_INTEGRATION: "0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086",
  
  // SIWE authentication
  SIWE_AUTH: "0x9d52E2f98E81E76cb1d72b032eD98135faEa1CcE",
  
  // External Durin registry
  DURIN_REGISTRY: "0xe815db6ab1a0c7dc201cbd1dd9ea9498ffd634cc",
} as const;

export const SUPPORTED_COUNTRIES = {
  GHA: { name: "Ghana", flag: "🇬🇭", code: "GHA" },
  NGA: { name: "Nigeria", flag: "🇳🇬", code: "NGA" },
  KEN: { name: "Kenya", flag: "🇰🇪", code: "KEN" },
  ZAF: { name: "South Africa", flag: "🇿🇦", code: "ZAF" },
  EGY: { name: "Egypt", flag: "🇪🇬", code: "EGY" },
} as const;

export const NETWORK_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Contract ABIs (simplified for demo)
export const AFRICAN_PROOF_ABI = [
  // Read functions
  "function userProfiles(address) view returns (bool isVerified, string country, string ensName, uint256 verificationTimestamp, bool isActive)",
  "function getTextRecord(address user, string key) view returns (string)",
  "function getUserCredentialsCount(address user) view returns (uint256)",
  "function getUserAttestationsCount(address user) view returns (uint256)",
  "function isUserVerified(address user) view returns (bool)",
  
  // Write functions
  "function verifyUser(address user, string country, string data)",
  "function setTextRecord(string key, string value)",
  "function addVerifiableCredential(string credentialType, string ipfsHash)",
  "function addCommunityAttestation(address target, string attestationType, string description)",
  "function sendMicroPayment(address recipient, string purpose) payable",
  "function sendRemittance(address recipient, string country) payable",
  
  // Events
  "event UserVerified(address indexed user, string country, string ensName, uint256 timestamp)",
  "event TextRecordUpdated(address indexed user, string key, string value)",
  "event MicroPaymentSent(address indexed sender, address indexed recipient, uint256 amount, string purpose)",
  "event RemittanceSent(address indexed sender, address indexed recipient, string country, uint256 amount)",
] as const;

export const DURIN_INTEGRATION_ABI = [
  // Read functions
  "function getUserSubdomain(address user) view returns (string)",
  "function isSubdomainAvailable(string subdomain, string country) view returns (bool)",
  "function getCountryRegistry(string country) view returns (address)",
  "function chainId() view returns (uint256)",
  "function coinType() view returns (uint256)",
  
  // Write functions
  "function mintUserSubdomain(address user, string subdomain, string country)",
  "function updateSubdomainTextRecord(string key, string value)",
  
  // Events
  "event SubdomainMinted(address indexed user, string subdomain, string country)",
  "event SubdomainUpdated(address indexed user, string subdomain, string key, string value)",
] as const;

export const SIWE_AUTH_ABI = [
  // Read functions
  "function hasValidSession(address user) view returns (bool)",
  "function getUserSession(address user) view returns (bool isActive, uint256 expiresAt, string nonce, string domain, uint256 lastActivity)",
  "function authorizedDomains(string domain) view returns (bool)",
  
  // Write functions
  "function generateNonce(address user) returns (string)",
  "function logout()",
  "function updateActivity()",
  
  // Events
  "event SIWELogin(address indexed user, string domain, uint256 expiresAt)",
  "event SIWELogout(address indexed user)",
  "event NonceGenerated(address indexed user, string nonce)",
] as const;

// Demo user data for testing
export const DEMO_USERS = {
  KWAME: {
    name: "Kwame Asante",
    country: "GHA",
    occupation: "Organic Farmer",
    location: "Kumasi, Ghana",
    subdomain: "kwame",
    bio: "Sustainable cocoa farmer with 10+ years experience",
  },
  AMINA: {
    name: "Amina Bello", 
    country: "NGA",
    occupation: "Agricultural Trader",
    location: "Lagos, Nigeria",
    subdomain: "amina",
    bio: "Cross-border agricultural trade specialist",
  },
  KOFI: {
    name: "Kofi Mwangi",
    country: "KEN", 
    occupation: "Blockchain Developer",
    location: "Nairobi, Kenya",
    subdomain: "kofi",
    bio: "Building Web3 solutions for Africa",
  },
} as const;

export const DEMO_FLOWS = {
  VERIFICATION: "Identity verification for African countries",
  ENS_SUBDOMAIN: "Mint hierarchical ENS subdomains",
  SIWE_AUTH: "Sign-In With Ethereum authentication", 
  PAYMENTS: "Cross-border payments and remittances",
  ATTESTATIONS: "Community trust building",
  CREDENTIALS: "Verifiable professional credentials",
} as const;
