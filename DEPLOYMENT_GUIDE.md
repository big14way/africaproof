# AfricanProof Deployment Guide

## 🚀 Ready for ETH Accra Hackathon

### Prerequisites
1. **Base Sepolia ETH**: Get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. **Environment Variables**: Set up `.env` files
3. **Self.xyz Integration**: Update hub addresses for Base network

### Quick Deployment Steps

#### 1. Install Dependencies
```bash
# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

#### 2. Configure Environment
```bash
# contracts/.env
BASE_PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# frontend/.env.local
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

#### 3. Deploy to Base Sepolia (Testnet)
```bash
cd contracts
npm run deploy:base-sepolia
```

#### 4. Deploy to Base Mainnet
```bash
cd contracts
npm run deploy:base
```

#### 5. Update Frontend Configuration
Update `frontend/lib/const.ts` with deployed contract addresses.

#### 6. Run Tests
```bash
cd contracts
npm test
```

#### 7. Start Frontend
```bash
cd frontend
npm run dev
```

### Key Contract Addresses (After Deployment)
- **AfricanProof**: `[TO_BE_DEPLOYED]`
- **EnhancedAfricanProof**: `[TO_BE_DEPLOYED]`
- **BaseAfricanEcosystem**: `[TO_BE_DEPLOYED]`
- **DisasterRelief**: `[TO_BE_DEPLOYED]`
- **AfricanGovernance**: `[TO_BE_DEPLOYED]`

### Demo Flow for Hackathon
1. **Identity Verification**: User verifies with Self.xyz (Ghana/Nigeria/Kenya/South Africa)
2. **ENS Domain Creation**: Gets `user.ghana.eth` domain with text records
3. **Add Credentials**: Upload education/employment/income verifications
4. **Community Attestation**: Get reputation attestation from verified users
5. **Financial Services**: 
   - Send micro-payments (sub-cent)
   - Cross-border remittances
   - Join community savings pool
   - Request micro-loan
6. **Disaster Relief**: Claim relief funds using verified identity

### ENS Track Features
- ✅ **Text Records**: Identity metadata, credentials, attestations
- ✅ **Community Attestations**: Peer verification system
- ✅ **Cross-border Coordination**: Multi-country identity support
- ✅ **Verifiable Credentials**: Education, employment, income proofs
- ✅ **Not an Afterthought**: Core to identity and financial system

### Base Track Features  
- ✅ **Real African Problems**: Financial inclusion, remittances
- ✅ **Sub-cent Payments**: 0.000001 ETH minimum transactions
- ✅ **Community Solutions**: Savings pools, micro-loans
- ✅ **Base Optimized**: Low gas costs, fast transactions

### Testing Checklist
- [ ] Deploy contracts to Base Sepolia
- [ ] Verify contracts on Base explorer
- [ ] Test complete user verification flow
- [ ] Test ENS domain creation and text records
- [ ] Test community attestations
- [ ] Test micro-payments and remittances
- [ ] Test community pools and micro-loans
- [ ] Test disaster relief claims
- [ ] Frontend integration testing
- [ ] End-to-end user journey testing

### Hackathon Presentation Points
1. **Problem**: 400M+ Africans lack financial access
2. **Solution**: Government-verified ENS identities for financial inclusion
3. **ENS Innovation**: Beyond name resolution - identity, credentials, attestations
4. **Base Benefits**: Sub-cent payments, community financial tools
5. **Real Impact**: Remittances, micro-finance, disaster relief
6. **Technical Excellence**: Comprehensive testing, clean architecture
7. **African Focus**: Ghana, Nigeria, Kenya, South Africa use cases

### Support & Resources
- **ENS Documentation**: https://docs.ens.domains
- **Base Documentation**: https://docs.base.org
- **Self.xyz Integration**: Check hub addresses for Base network
- **Contract Verification**: Use Base explorer for verification

---

**AfricanProof: Where Identity Meets Opportunity** 🌍
