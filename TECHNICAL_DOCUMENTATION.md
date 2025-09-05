# 🔧 AfricanProof - Technical Documentation

## 🏗️ Smart Contract Architecture

### Core Contracts Overview

| Contract | Purpose | Features | Gas Usage |
|----------|---------|----------|-----------|
| **ProductionAfricanProof** | Core identity & payments | Verification, attestations, payments | ~3M gas |
| **AfricanProofWithDurin** | L2 ENS subdomains | Subdomain minting, text records | ~4.4M gas |
| **AfricanProofWithSIWE** | Authentication | SIWE, session management | ~5.8M gas |

## 🚀 Deployed Contracts (Base Sepolia)

### Production Deployment
- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **Deployer**: `0x3C343AD077983371b29fee386bdBC8a92E934C51`
- **Total Gas Used**: 13,293,902
- **Total Cost**: ~0.013 ETH

### Contract Addresses
```javascript
const CONTRACTS = {
  ProductionAfricanProof: "0xBC358610EC9d2232b6837018A328b54E9D72cB26",
  AfricanProofWithDurin: "0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086", 
  AfricanProofWithSIWE: "0x9d52E2f98E81E76cb1d72b032eD98135faEa1CcE",
  DurinRegistry: "0xe815db6ab1a0c7dc201cbd1dd9ea9498ffd634cc"
};
```

## 📋 Contract Interfaces

### ProductionAfricanProof

#### Core Functions
```solidity
// Identity Verification
function verifyUser(address user, string country, string data) external;
function isUserVerified(address user) external view returns (bool);

// ENS Text Records
function setTextRecord(string key, string value) external;
function getTextRecord(address user, string key) external view returns (string);

// Verifiable Credentials
function addVerifiableCredential(string credentialType, string ipfsHash) external;
function getUserCredentialsCount(address user) external view returns (uint256);

// Community Attestations
function addCommunityAttestation(address target, string attestationType, string description) external;
function getUserAttestationsCount(address user) external view returns (uint256);

// Payments
function sendMicroPayment(address recipient, string purpose) external payable;
function sendRemittance(address recipient, string country) external payable;
```

#### Events
```solidity
event UserVerified(address indexed user, string country, string ensName, uint256 timestamp);
event TextRecordUpdated(address indexed user, string key, string value);
event CredentialAdded(address indexed user, string credentialType, string ipfsHash);
event AttestationAdded(address indexed attester, address indexed target, string attestationType);
event MicroPaymentSent(address indexed sender, address indexed recipient, uint256 amount, string purpose);
event RemittanceSent(address indexed sender, address indexed recipient, string country, uint256 amount);
```

### AfricanProofWithDurin

#### ENS Functions
```solidity
// Subdomain Management
function mintUserSubdomain(address user, string subdomain, string country) external;
function getUserSubdomain(address user) external view returns (string);
function isSubdomainAvailable(string subdomain, string country) external view returns (bool);

// Registry Management
function addCountryRegistry(string country, address registry) external onlyOwner;
function getCountryRegistry(string country) external view returns (address);

// Text Records
function updateSubdomainTextRecord(string key, string value) external;
```

### AfricanProofWithSIWE

#### Authentication Functions
```solidity
// SIWE Authentication
function generateNonce(address user) external returns (string);
function authenticateWithSIWE(SIWEMessage message, bytes signature) external;
function hasValidSession(address user) external view returns (bool);

// Session Management
function logout() external;
function updateActivity() external;
function getUserSession(address user) external view returns (UserSession);

// Domain Management
function addAuthorizedDomain(string domain) external onlyOwner;
function removeAuthorizedDomain(string domain) external onlyOwner;
```

## 🌍 Supported Countries Configuration

```javascript
const SUPPORTED_COUNTRIES = {
  "GHA": { name: "Ghana", flag: "🇬🇭" },
  "NGA": { name: "Nigeria", flag: "🇳🇬" },
  "KEN": { name: "Kenya", flag: "🇰🇪" },
  "ZAF": { name: "South Africa", flag: "🇿🇦" },
  "EGY": { name: "Egypt", flag: "🇪🇬" }
};
```

## 🔐 Security Features

### Access Control
- **Owner-only functions**: Contract upgrades, country additions
- **Verification Hub**: Authorized identity verification
- **User-only functions**: Profile updates, payments
- **Session-based**: SIWE authentication required

### Safety Mechanisms
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Input validation**: Comprehensive parameter checking
- **Gas optimization**: Efficient storage patterns

## 💰 Economic Model

### Payment Structure
```solidity
uint256 public constant MIN_PAYMENT = 0.000001 ether; // 1 gwei minimum
uint256 public constant PLATFORM_FEE_BASIS_POINTS = 25; // 0.25%
```

### Fee Distribution
- **Platform Fee**: 0.25% on all transactions
- **Minimum Payment**: 0.000001 ETH (optimized for Base)
- **Gas Optimization**: Batch operations, efficient storage

## 🧪 Testing Framework

### Test Coverage: 76/76 Tests (100%)

#### Test Categories
```bash
# Core Functionality Tests
ProductionAfricanProof.test.js     # 27 tests ✅
SimpleAfricanProof.test.js         # 18 tests ✅
EnhancedAfricanProofSimplified.test.js # 10 tests ✅
AfricanProofWithENS.test.js        # 9 tests ✅
Basic.test.js                      # 4 tests ✅
Simple.test.js                     # 7 tests ✅
AfricanProofWithEFP.test.js        # 1 test ✅ (modular approach)
```

#### Integration Tests
```bash
# Run interaction tests
npx hardhat run scripts/testInteractions.js

# Run hackathon demo flow
npx hardhat run scripts/hackathonDemoFlow.js
```

## 🔄 Frontend Integration Guide

### Web3 Setup
```javascript
import { ethers } from 'ethers';
import { useAccount, useContract, useSigner } from 'wagmi';

// Contract setup
const africanProofContract = useContract({
  address: "0xBC358610EC9d2232b6837018A328b54E9D72cB26",
  abi: ProductionAfricanProofABI,
  signerOrProvider: signer
});
```

### User Verification Flow
```javascript
// 1. Verify user identity
const verifyUser = async (country, verificationData) => {
  const tx = await africanProofContract.verifyUser(
    userAddress, 
    country, 
    verificationData
  );
  await tx.wait();
};

// 2. Mint ENS subdomain
const mintSubdomain = async (subdomain, country) => {
  const durinContract = new ethers.Contract(
    "0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086",
    AfricanProofWithDurinABI,
    signer
  );
  
  const tx = await durinContract.mintUserSubdomain(
    userAddress, 
    subdomain, 
    country
  );
  await tx.wait();
};

// 3. SIWE Authentication
const authenticateWithSIWE = async () => {
  const siweContract = new ethers.Contract(
    "0x9d52E2f98E81E76cb1d72b032eD98135faEa1CcE",
    AfricanProofWithSIWEABI,
    signer
  );
  
  const nonce = await siweContract.generateNonce(userAddress);
  // Create and sign SIWE message
  // Call authenticateWithSIWE with message and signature
};
```

### Payment Integration
```javascript
// Send micro-payment
const sendPayment = async (recipient, amount, purpose) => {
  const tx = await africanProofContract.sendMicroPayment(
    recipient,
    purpose,
    { value: ethers.parseEther(amount) }
  );
  await tx.wait();
};

// Send cross-border remittance
const sendRemittance = async (recipient, country, amount) => {
  const tx = await africanProofContract.sendRemittance(
    recipient,
    country,
    { value: ethers.parseEther(amount) }
  );
  await tx.wait();
};
```

## 📊 Performance Metrics

### Gas Optimization
- **Deployment**: 13.3M gas total
- **Verification**: ~150k gas per user
- **Subdomain Minting**: ~200k gas
- **Payments**: ~80k gas per transaction

### Network Performance (Base Sepolia)
- **Block Time**: ~2 seconds
- **Transaction Finality**: ~12 seconds
- **Gas Price**: ~1 gwei
- **Cost per Transaction**: <$0.01

## 🛠️ Development Setup

### Prerequisites
```bash
# Required versions
Node.js: 18+
npm: 9+
Hardhat: 2.19+
Solidity: 0.8.20
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Required environment variables
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
DURIN_REGISTRY_ADDRESS=0xe815db6ab1a0c7dc201cbd1dd9ea9498ffd634cc
```

### Build & Deploy
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Base Sepolia
npx hardhat run scripts/deployToBase.js --network baseSepolia
```

## 🔍 Verification & Monitoring

### Contract Verification
```bash
# Verify on BaseScan
npx hardhat verify --network baseSepolia 0xBC358610EC9d2232b6837018A328b54E9D72cB26 "0x3C343AD077983371b29fee386bdBC8a92E934C51"
```

### Monitoring Tools
- **BaseScan**: https://sepolia.basescan.org
- **Tenderly**: Contract monitoring and debugging
- **OpenZeppelin Defender**: Security monitoring
- **Alchemy**: RPC and analytics

## 🚨 Security Considerations

### Known Limitations
- **Centralized Verification**: Requires trusted verification hub
- **ENS Dependency**: Relies on ENS infrastructure
- **Gas Costs**: High deployment costs for complex contracts

### Mitigation Strategies
- **Multi-sig governance**: Decentralized control
- **Gradual decentralization**: Progressive ownership transfer
- **Audit schedule**: Regular security reviews
- **Bug bounty program**: Community security testing

## 📈 Scaling Strategy

### Phase 1: Foundation (Current)
- ✅ Core contracts deployed
- ✅ Base Sepolia testing
- ✅ Frontend integration ready

### Phase 2: Expansion
- 🔄 Additional African countries
- 🔄 Mobile app development
- 🔄 Mainnet deployment
- 🔄 Partnership integrations

### Phase 3: Optimization
- 📋 Layer 2 scaling solutions
- 📋 Cross-chain compatibility
- 📋 Advanced privacy features
- 📋 Institutional adoption
