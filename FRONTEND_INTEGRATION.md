# 🔗 Frontend Integration Guide

## 🎯 Contract Configuration

### Base Sepolia Network Setup
```javascript
// wagmi.config.js or your Web3 config
import { baseSepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});

// Network details
const NETWORK = {
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
```

### Contract Addresses
```javascript
// contracts/config.js
export const CONTRACTS = {
  // Core identity and payment contract
  AFRICAN_PROOF: "0xBC358610EC9d2232b6837018A328b54E9D72cB26",
  
  // ENS L2 subdomain management
  DURIN_INTEGRATION: "0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086",
  
  // SIWE authentication
  SIWE_AUTH: "0x9d52E2f98E81E76cb1d72b032eD98135faEa1CcE",
  
  // External Durin registry
  DURIN_REGISTRY: "0xe815db6ab1a0c7dc201cbd1dd9ea9498ffd634cc",
};

export const SUPPORTED_COUNTRIES = {
  GHA: { name: "Ghana", flag: "🇬🇭" },
  NGA: { name: "Nigeria", flag: "🇳🇬" },
  KEN: { name: "Kenya", flag: "🇰🇪" },
  ZAF: { name: "South Africa", flag: "🇿🇦" },
  EGY: { name: "Egypt", flag: "🇪🇬" },
};
```

## 🔧 Core Integration Functions

### 1. User Verification
```javascript
// hooks/useAfricanProof.js
import { useContract, useSigner } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import ProductionAfricanProofABI from '../abis/ProductionAfricanProof.json';

export const useAfricanProof = () => {
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: CONTRACTS.AFRICAN_PROOF,
    abi: ProductionAfricanProofABI,
    signerOrProvider: signer,
  });

  const verifyUser = async (country, verificationData) => {
    try {
      const tx = await contract.verifyUser(
        signer.address,
        country,
        verificationData
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isUserVerified = async (address) => {
    try {
      const profile = await contract.userProfiles(address);
      return profile.isVerified;
    } catch (error) {
      console.error('Error checking verification:', error);
      return false;
    }
  };

  const getUserProfile = async (address) => {
    try {
      const profile = await contract.userProfiles(address);
      return {
        isVerified: profile.isVerified,
        country: profile.country,
        ensName: profile.ensName,
        verificationTimestamp: profile.verificationTimestamp,
        isActive: profile.isActive,
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  };

  return {
    contract,
    verifyUser,
    isUserVerified,
    getUserProfile,
  };
};
```

### 2. ENS Subdomain Management
```javascript
// hooks/useDurinIntegration.js
import { useContract, useSigner } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import AfricanProofWithDurinABI from '../abis/AfricanProofWithDurin.json';

export const useDurinIntegration = () => {
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: CONTRACTS.DURIN_INTEGRATION,
    abi: AfricanProofWithDurinABI,
    signerOrProvider: signer,
  });

  const mintSubdomain = async (subdomain, country) => {
    try {
      const tx = await contract.mintUserSubdomain(
        signer.address,
        subdomain,
        country
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserSubdomain = async (address) => {
    try {
      const subdomain = await contract.getUserSubdomain(address);
      return subdomain;
    } catch (error) {
      console.error('Error getting subdomain:', error);
      return '';
    }
  };

  const isSubdomainAvailable = async (subdomain, country) => {
    try {
      const available = await contract.isSubdomainAvailable(subdomain, country);
      return available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const updateTextRecord = async (key, value) => {
    try {
      const tx = await contract.updateSubdomainTextRecord(key, value);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    contract,
    mintSubdomain,
    getUserSubdomain,
    isSubdomainAvailable,
    updateTextRecord,
  };
};
```

### 3. SIWE Authentication
```javascript
// hooks/useSIWEAuth.js
import { useContract, useSigner, useAccount } from 'wagmi';
import { SiweMessage } from 'siwe';
import { CONTRACTS } from '../config/contracts';
import AfricanProofWithSIWEABI from '../abis/AfricanProofWithSIWE.json';

export const useSIWEAuth = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  
  const contract = useContract({
    address: CONTRACTS.SIWE_AUTH,
    abi: AfricanProofWithSIWEABI,
    signerOrProvider: signer,
  });

  const generateNonce = async () => {
    try {
      const nonce = await contract.generateNonce(address);
      return nonce;
    } catch (error) {
      console.error('Error generating nonce:', error);
      return null;
    }
  };

  const signInWithEthereum = async (domain = 'africanproof.app') => {
    try {
      // 1. Generate nonce
      const nonce = await generateNonce();
      if (!nonce) throw new Error('Failed to generate nonce');

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain,
        address,
        statement: 'Sign in to AfricanProof with your Ethereum account.',
        uri: window.location.origin,
        version: '1',
        chainId: 84532,
        nonce,
        issuedAt: new Date().toISOString(),
      });

      // 3. Sign message
      const messageString = message.prepareMessage();
      const signature = await signer.signMessage(messageString);

      // 4. Authenticate with contract
      const siweMessage = {
        domain: message.domain,
        userAddress: message.address,
        statement: message.statement,
        uri: message.uri,
        version: message.version,
        chainId: message.chainId,
        nonce: message.nonce,
        issuedAt: message.issuedAt,
        expirationTime: '',
        notBefore: '',
        requestId: '',
        resources: [],
      };

      const tx = await contract.authenticateWithSIWE(siweMessage, signature);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const hasValidSession = async (userAddress) => {
    try {
      const hasSession = await contract.hasValidSession(userAddress);
      return hasSession;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const tx = await contract.logout();
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    contract,
    generateNonce,
    signInWithEthereum,
    hasValidSession,
    logout,
  };
};
```

### 4. Payment Functions
```javascript
// hooks/usePayments.js
import { parseEther } from 'ethers/lib/utils';
import { useAfricanProof } from './useAfricanProof';

export const usePayments = () => {
  const { contract } = useAfricanProof();

  const sendMicroPayment = async (recipient, amount, purpose) => {
    try {
      const tx = await contract.sendMicroPayment(
        recipient,
        purpose,
        { value: parseEther(amount) }
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const sendRemittance = async (recipient, country, amount) => {
    try {
      const tx = await contract.sendRemittance(
        recipient,
        country,
        { value: parseEther(amount) }
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    sendMicroPayment,
    sendRemittance,
  };
};
```

## 🎨 UI Components Examples

### Verification Component
```jsx
// components/VerificationForm.jsx
import { useState } from 'react';
import { useAfricanProof } from '../hooks/useAfricanProof';
import { SUPPORTED_COUNTRIES } from '../config/contracts';

export const VerificationForm = () => {
  const [country, setCountry] = useState('');
  const [verificationData, setVerificationData] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyUser } = useAfricanProof();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await verifyUser(country, verificationData);
    
    if (result.success) {
      alert('Verification successful!');
    } else {
      alert(`Verification failed: ${result.error}`);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="verification-form">
      <h2>🆔 Verify Your Identity</h2>
      
      <select 
        value={country} 
        onChange={(e) => setCountry(e.target.value)}
        required
      >
        <option value="">Select Country</option>
        {Object.entries(SUPPORTED_COUNTRIES).map(([code, info]) => (
          <option key={code} value={code}>
            {info.flag} {info.name}
          </option>
        ))}
      </select>
      
      <input
        type="text"
        placeholder="Verification Data"
        value={verificationData}
        onChange={(e) => setVerificationData(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Identity'}
      </button>
    </form>
  );
};
```

### ENS Subdomain Component
```jsx
// components/SubdomainMinter.jsx
import { useState } from 'react';
import { useDurinIntegration } from '../hooks/useDurinIntegration';

export const SubdomainMinter = ({ userCountry }) => {
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const { mintSubdomain, isSubdomainAvailable } = useDurinIntegration();

  const handleMint = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Check availability first
    const available = await isSubdomainAvailable(subdomain, userCountry);
    if (!available) {
      alert('Subdomain not available');
      setLoading(false);
      return;
    }
    
    const result = await mintSubdomain(subdomain, userCountry);
    
    if (result.success) {
      alert(`Subdomain minted: ${subdomain}.${userCountry.toLowerCase()}.gwill.eth`);
    } else {
      alert(`Minting failed: ${result.error}`);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleMint} className="subdomain-form">
      <h2>🏷️ Mint Your ENS Subdomain</h2>
      
      <div className="subdomain-preview">
        <input
          type="text"
          placeholder="Enter subdomain"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
          pattern="[a-z0-9-]+"
          required
        />
        <span>.{userCountry?.toLowerCase()}.gwill.eth</span>
      </div>
      
      <button type="submit" disabled={loading || !subdomain}>
        {loading ? 'Minting...' : 'Mint Subdomain'}
      </button>
    </form>
  );
};
```

## 🧪 Testing Integration

### Test User Flow
```javascript
// utils/testFlow.js
export const testCompleteFlow = async () => {
  console.log('🧪 Testing complete AfricanProof flow...');
  
  // 1. Test verification
  const verification = await verifyUser('GHA', 'test-data');
  console.log('Verification:', verification);
  
  // 2. Test subdomain minting
  const subdomain = await mintSubdomain('testuser', 'GHA');
  console.log('Subdomain:', subdomain);
  
  // 3. Test SIWE authentication
  const auth = await signInWithEthereum();
  console.log('SIWE Auth:', auth);
  
  // 4. Test payment
  const payment = await sendMicroPayment(
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0.001',
    'Test payment'
  );
  console.log('Payment:', payment);
};
```

## 🚀 Deployment Checklist

### Pre-Integration
- [ ] Pull latest frontend changes from teammate
- [ ] Install required dependencies (wagmi, ethers, siwe)
- [ ] Update contract addresses in config
- [ ] Add Base Sepolia network configuration

### Integration Steps
- [ ] Import contract ABIs
- [ ] Implement custom hooks
- [ ] Create UI components
- [ ] Test wallet connection
- [ ] Test contract interactions

### Testing
- [ ] Test on Base Sepolia testnet
- [ ] Verify all contract functions work
- [ ] Test error handling
- [ ] Test user flows end-to-end

### Demo Preparation
- [ ] Prepare demo accounts with testnet ETH
- [ ] Test complete user journey
- [ ] Prepare fallback plans
- [ ] Document any issues

**Ready for seamless frontend integration! 🎯**
