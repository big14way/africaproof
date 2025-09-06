# 🧪 **AFRICANPROOF COMPREHENSIVE TESTING GUIDE**

## 🎯 **OVERVIEW**
This guide provides step-by-step testing procedures to verify all AfricanProof functionalities work correctly with smart contract integration.

## 🔧 **PRE-TESTING SETUP**

### **1. Environment Requirements**
- ✅ MetaMask wallet installed
- ✅ Base Sepolia testnet added to MetaMask
- ✅ Base Sepolia ETH (get from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- ✅ ENS name (optional but recommended for full testing)

### **2. Network Configuration**
```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

### **3. Contract Addresses (Base Sepolia)**
- **Core Contract:** `0xBC358610EC9d2232b6837018A328b54E9D72cB26`
- **Durin Integration:** `0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086`
- **SIWE Auth:** `0x9d52E2f98E81E76cb1d72b032eD98135faEa1CcE`

---

## 🌐 **TEST SUITE 1: HOMEPAGE & GLOBE**

### **Test 1.1: 3D Globe Rendering**
**Steps:**
1. Navigate to `http://localhost:3000`
2. Wait for page to load completely

**Expected Results:**
- ✅ Realistic 3D Earth globe appears (not cartoon)
- ✅ Globe shows Africa prominently positioned
- ✅ Globe rotates smoothly
- ✅ Network connection animations visible (arcs between cities)
- ✅ African cities highlighted in green/yellow
- ✅ Global cities shown in blue
- ✅ Accra specifically highlighted in yellow (ETH Accra)

**Failure Indicators:**
- ❌ No globe visible
- ❌ Cartoon/simple globe instead of realistic Earth
- ❌ No network animations
- ❌ Globe not rotating

---

## 🔗 **TEST SUITE 2: WALLET CONNECTION & ENS**

### **Test 2.1: RainbowKit Connection**
**Steps:**
1. Click "Connect Wallet" button in top navigation
2. Select MetaMask from RainbowKit modal
3. Approve connection in MetaMask

**Expected Results:**
- ✅ RainbowKit modal appears with wallet options
- ✅ MetaMask connection successful
- ✅ Button shows ENS name (e.g., "gwill.eth") if available
- ✅ Button shows shortened address if no ENS (e.g., "0x1234...5678")
- ✅ Network automatically switches to Base Sepolia

**Failure Indicators:**
- ❌ Shows full 0x address instead of ENS name
- ❌ Connection fails
- ❌ Wrong network displayed

### **Test 2.2: ENS Name Resolution**
**Steps:**
1. Connect wallet with ENS name
2. Observe wallet display in navigation

**Expected Results:**
- ✅ Shows "gwill.eth" (or your ENS name)
- ✅ Does NOT show "0x1234...5678" format

---

## 🆔 **TEST SUITE 3: IDENTITY VERIFICATION**

### **Test 3.1: Country Selection & Verification**
**Steps:**
1. Navigate to `/africanproof`
2. Go to "🆔 Verification" tab
3. Select country (e.g., Ghana)
4. Enter verification data (e.g., "GHA-ID-12345")
5. Click "Verify Identity"
6. Confirm MetaMask transaction

**Expected Results:**
- ✅ Country dropdown shows all African countries with flags
- ✅ MetaMask popup appears for transaction
- ✅ Transaction cost ~$0.01-0.02
- ✅ After confirmation: "✅ Verified" status appears
- ✅ Transaction visible on Base Sepolia explorer
- ✅ Contract interaction: `0xBC358610EC9d2232b6837018A328b54E9D72cB26`

**Failure Indicators:**
- ❌ Transaction fails
- ❌ No status update after transaction
- ❌ High gas fees (>$0.10)

---

## 🏷️ **TEST SUITE 4: ENS SUBDOMAIN MINTING**

### **Test 4.1: Durin L2 Subdomain Creation**
**Steps:**
1. Go to "🏷️ ENS Subdomain" tab
2. Enter subdomain name (e.g., "kwame")
3. Verify preview shows "kwame.gha.gwill.eth"
4. Click "Mint ENS Subdomain"
5. Confirm MetaMask transaction

**Expected Results:**
- ✅ Preview updates dynamically based on country selection
- ✅ MetaMask popup appears
- ✅ Transaction cost ~$0.01-0.02
- ✅ After confirmation: ENS domain displayed
- ✅ Format: `[name].[country-code].gwill.eth`
- ✅ Contract interaction: `0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086`

**Failure Indicators:**
- ❌ Wrong domain format
- ❌ Transaction fails
- ❌ Domain not displayed after minting

---

## 🔐 **TEST SUITE 5: SIWE AUTHENTICATION**

### **Test 5.1: Sign-In With Ethereum**
**Steps:**
1. Go to "🔐 SIWE Auth" tab
2. Click "Sign-In With Ethereum"
3. Sign message in MetaMask (no gas cost)

**Expected Results:**
- ✅ MetaMask signature popup (NOT transaction)
- ✅ No gas cost (message signing is free)
- ✅ "✅ Successfully authenticated" message
- ✅ Shows authenticated address
- ✅ Shows signature preview
- ✅ "Sign Out" button appears

**Failure Indicators:**
- ❌ Gas cost required (should be free)
- ❌ No authentication confirmation
- ❌ Signature not displayed

---

## 💰 **TEST SUITE 6: PAYMENTS**

### **Test 6.1: Cross-Border Payment**
**Steps:**
1. Go to "💰 Payments" tab
2. Enter recipient address
3. Set amount (e.g., 0.001 ETH)
4. Add purpose description
5. Click "Send Payment"
6. Confirm MetaMask transaction

**Expected Results:**
- ✅ MetaMask transaction popup
- ✅ ETH actually transferred to recipient
- ✅ Transaction visible on Base Sepolia explorer
- ✅ Balance decreases by sent amount + gas

**Failure Indicators:**
- ❌ Transaction fails
- ❌ ETH not transferred
- ❌ High gas fees

---

## 🤝 **TEST SUITE 7: COMMUNITY & EFP**

### **Test 7.1: Ethereum Follow Protocol**
**Steps:**
1. Go to "🤝 Community" tab
2. Scroll to EFP section
3. Enter wallet address to follow
4. Click "Follow Professional"
5. Confirm transaction

**Expected Results:**
- ✅ EFP integration visible at top of Community tab
- ✅ Network stats show follower/following counts
- ✅ Follow transaction succeeds
- ✅ Following list updates

**Note:** EFP contracts may not be deployed on Base Sepolia yet, so this might show placeholder behavior.

### **Test 7.2: Community Attestations**
**Steps:**
1. In Community tab, scroll to attestation section
2. Enter target address
3. Select attestation type
4. Add description
5. Click "Add Attestation"

**Expected Results:**
- ✅ Attestation transaction succeeds
- ✅ Contract interaction recorded

---

## 🔍 **TEST SUITE 8: INTEGRATION VERIFICATION**

### **Test 8.1: Smart Contract Integration Check**
**Verification Steps:**
1. Check all transactions on Base Sepolia explorer
2. Verify contract addresses match deployed contracts
3. Confirm transaction data is correct

**Contract Verification:**
- Visit: https://sepolia.basescan.org
- Search each contract address
- Verify transactions appear correctly

### **Test 8.2: ENS Ecosystem Integration**
**Verification Points:**
- ✅ Durin L2 subdomains working
- ✅ SIWE standard implemented
- ✅ ENS name resolution in wallet display
- ✅ EFP integration (when contracts available)

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Globe Not Loading**
**Solution:** Refresh page, check browser console for errors

### **Issue 2: ENS Name Not Showing**
**Solution:** Ensure wallet has ENS name, check network is correct

### **Issue 3: High Gas Fees**
**Solution:** Ensure on Base Sepolia (not mainnet)

### **Issue 4: Transaction Failures**
**Solution:** Check Base Sepolia ETH balance, try lower gas limit

---

## ✅ **SUCCESS CRITERIA**

### **Minimum Viable Demo:**
- ✅ 3D globe with network animations
- ✅ Wallet connection with ENS display
- ✅ Identity verification working
- ✅ ENS subdomain minting working
- ✅ SIWE authentication working

### **Full Feature Demo:**
- ✅ All above + payments working
- ✅ Community features functional
- ✅ EFP integration visible
- ✅ All smart contracts responding

---

## 🎪 **DEMO SCRIPT FOR HACKATHON**

### **Opening (30 seconds)**
"Welcome to AfricanProof - notice this beautiful rotating Earth globe showing Africa with live network connections between cities."

### **Connection (30 seconds)**
"Let me connect my wallet using RainbowKit - see how it shows my ENS name 'gwill.eth' instead of a long address."

### **Core Features (2 minutes)**
1. "I'll verify as a Ghanaian farmer" → Show verification
2. "Now I mint my ENS subdomain: kwame.gha.gwill.eth" → Show minting
3. "Here's SIWE authentication - proving wallet ownership" → Show SIWE
4. "I can send instant cross-border payments" → Show payment

### **Advanced Features (1 minute)**
"Our Community tab shows Ethereum Follow Protocol integration for professional networking, plus traditional attestations."

### **Closing (30 seconds)**
"All running live on Base network with full ENS ecosystem integration - solving real African identity and financial inclusion challenges."

**Total Demo Time: 4 minutes**
