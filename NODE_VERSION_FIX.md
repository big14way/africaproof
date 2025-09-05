# Node.js Version Fix for AfricanProof

## Current Issue
- **Current Node.js Version**: 23.11.0
- **Hardhat Requirement**: Node.js 22.10.0 or later LTS version (even major version number)
- **Error**: "You are using Node.js 23.11.0 which is not supported by Hardhat"

## Solutions

### Option 1: Use Node Version Manager (NVM) - RECOMMENDED

#### Install NVM (if not already installed)
```bash
# For macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc
```

#### Install and Use Node.js 22 LTS
```bash
# Install Node.js 22 LTS
nvm install 22

# Use Node.js 22 for this project
nvm use 22

# Verify version
node --version  # Should show v22.x.x

# Make Node.js 22 default (optional)
nvm alias default 22
```

#### Set Node.js 22 for this project specifically
```bash
# In the project root directory
echo "22" > .nvmrc

# Then use:
nvm use
```

### Option 2: Use Volta (Alternative Node Manager)

#### Install Volta
```bash
# macOS/Linux
curl https://get.volta.sh | bash

# Restart terminal
```

#### Pin Node.js 22 for this project
```bash
# In the project root
volta pin node@22

# This creates/updates package.json with volta config
```

### Option 3: Direct Node.js Installation

#### Download and Install Node.js 22 LTS
1. Go to https://nodejs.org/
2. Download Node.js 22.x.x LTS
3. Install and restart terminal

### Option 4: Use Docker (For Isolated Environment)

#### Create Dockerfile
```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 8545

CMD ["npm", "run", "compile"]
```

#### Run with Docker
```bash
# Build image
docker build -t africanproof .

# Run compilation
docker run -v $(pwd):/app africanproof npx hardhat compile

# Run tests
docker run -v $(pwd):/app africanproof npx hardhat test
```

## Quick Fix Commands

### For this session (temporary)
```bash
# Navigate to project
cd /Users/user/gwill/web3/LatAmProof/contracts

# Install and use Node.js 22
nvm install 22
nvm use 22

# Verify
node --version

# Now try compilation
npx hardhat compile
```

### For permanent fix
```bash
# Set Node.js 22 as default
nvm alias default 22

# Or create .nvmrc file
echo "22" > .nvmrc
```

## After Node.js Fix - Next Steps

1. **Clean and Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Compile Contracts**
```bash
npx hardhat compile
```

3. **Run Tests**
```bash
npx hardhat test
```

4. **Deploy to Base Sepolia**
```bash
npx hardhat run scripts/deployBase.ts --network baseSepolia
```

## Verification Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Hardhat version
npx hardhat --version

# Test Hardhat works
npx hardhat help
```

## Expected Output After Fix

```
$ node --version
v22.11.0

$ npx hardhat compile
Compiled 5 Solidity files successfully

$ npx hardhat test
✓ Should deploy ProductionAfricanProof successfully
✓ Should verify users for African countries
✓ All tests passing
```

## Troubleshooting

### If NVM command not found
```bash
# Add to ~/.bashrc or ~/.zshrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

### If still getting Node.js errors
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try with --legacy-peer-deps if needed
npm install --legacy-peer-deps
```

## Ready for Production

Once Node.js is fixed, the AfricanProof project is ready for:
- ✅ Compilation
- ✅ Testing  
- ✅ Deployment to Base
- ✅ ETH Accra hackathon demo

**Priority**: Fix Node.js version first, then everything else will work smoothly!
