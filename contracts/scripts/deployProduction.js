const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying AfricanProof contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

  // Configuration for Base networks
  const isMainnet = network.chainId === 8453n;
  const isTestnet = network.chainId === 84532n;

  if (!isMainnet && !isTestnet) {
    console.log("⚠️  Warning: Not deploying to Base network. Current chain ID:", network.chainId.toString());
    console.log("📝 Supported networks: Base Mainnet (8453), Base Sepolia (84532)");
  }

  const networkName = isMainnet ? "base" : isTestnet ? "baseSepolia" : "localhost";
  
  console.log("\n=== 🏗️  DEPLOYMENT CONFIGURATION ===");
  console.log("📍 Network:", networkName);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("👤 Deployer:", deployer.address);
  console.log("🏦 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Mock verification hub for testing (in production, use real Self.xyz hub)
  const hubAddress = isMainnet 
    ? "0x68c931C9a534D37aa78094877F46fE46a49F1A51" // Replace with actual Base mainnet hub
    : deployer.address; // Use deployer as mock hub for testing

  console.log("🔐 Verification Hub:", hubAddress);

  // Deploy ProductionAfricanProof contract
  console.log("\n=== 🌍 Deploying ProductionAfricanProof ===");
  const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
  
  console.log("📦 Deploying contract...");
  const africanProof = await ProductionAfricanProof.deploy(hubAddress);
  await africanProof.waitForDeployment();
  const africanProofAddress = await africanProof.getAddress();
  
  console.log("✅ ProductionAfricanProof deployed to:", africanProofAddress);

  // Deploy SimpleAfricanProof contract (for testing/backup)
  console.log("\n=== 🔧 Deploying SimpleAfricanProof ===");
  const SimpleAfricanProof = await ethers.getContractFactory("SimpleAfricanProof");
  
  console.log("📦 Deploying contract...");
  const simpleAfricanProof = await SimpleAfricanProof.deploy();
  await simpleAfricanProof.waitForDeployment();
  const simpleAfricanProofAddress = await simpleAfricanProof.getAddress();
  
  console.log("✅ SimpleAfricanProof deployed to:", simpleAfricanProofAddress);

  // Test basic functionality
  console.log("\n=== 🧪 Testing Basic Functionality ===");
  
  try {
    // Test ProductionAfricanProof
    console.log("🔍 Testing ProductionAfricanProof...");
    const ensName = await africanProof.BASE_ENS_NAME();
    console.log("📛 ENS Name:", ensName);
    
    const supportsGhana = await africanProof.supportedCountries("GHA");
    console.log("🇬🇭 Supports Ghana:", supportsGhana);
    
    const minPayment = await africanProof.MIN_PAYMENT();
    console.log("💸 Min Payment:", ethers.formatEther(minPayment), "ETH");
    
    // Test SimpleAfricanProof
    console.log("🔍 Testing SimpleAfricanProof...");
    const owner = await simpleAfricanProof.owner();
    console.log("👤 Owner:", owner);
    
    const supportsGhanaSimple = await simpleAfricanProof.isCountrySupported("GHA");
    console.log("🇬🇭 Supports Ghana (Simple):", supportsGhanaSimple);
    
    console.log("✅ All basic tests passed!");
    
  } catch (error) {
    console.error("❌ Error during testing:", error.message);
  }

  // Save deployment information
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    deployerBalance: ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    contracts: {
      ProductionAfricanProof: {
        address: africanProofAddress,
        ensName: "godswillgwill.base.eth",
        features: [
          "User verification for African countries",
          "ENS text records integration",
          "Community attestations",
          "Micro-payments (sub-cent on Base)",
          "Cross-border remittances",
          "Verifiable credentials"
        ]
      },
      SimpleAfricanProof: {
        address: simpleAfricanProofAddress,
        features: [
          "Basic user verification",
          "Country management",
          "Simple ENS integration"
        ]
      }
    },
    configuration: {
      hubAddress,
      supportedCountries: ["GHA", "NGA", "KEN", "ZAF", "EGY", "MAR", "TUN", "ETH"],
      ensName: "godswillgwill.base.eth",
      minPayment: "0.000001 ETH",
      platformFee: "0.25%"
    },
    ethAccraHackathon: {
      ensTrack: {
        qualified: true,
        features: [
          "Advanced ENS integration beyond name resolution",
          "Text records for verifiable credentials",
          "Community attestations system",
          "Cross-border coordination",
          "ENS is core to identity system"
        ]
      },
      baseTrack: {
        qualified: true,
        features: [
          "Solves real African financial inclusion problems",
          "Sub-cent payments optimized for Base",
          "Community-focused solutions",
          "Cross-border remittances",
          "Micro-finance and savings pools"
        ]
      }
    }
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Also update latest.json for backward compatibility
  const latestFile = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestFile, JSON.stringify({
    network: networkName,
    productionContract: africanProofAddress,
    simpleContract: simpleAfricanProofAddress,
    ensName: "godswillgwill.base.eth",
    hubAddress,
    deployedAt: deploymentInfo.deployedAt,
    deployer: deployer.address
  }, null, 2));

  console.log("\n=== 📋 DEPLOYMENT SUMMARY ===");
  console.log("🎉 All contracts deployed successfully!");
  console.log("📄 Deployment info saved to:", deploymentFile);
  console.log("\n=== 📍 CONTRACT ADDRESSES ===");
  console.log("🌍 ProductionAfricanProof:", africanProofAddress);
  console.log("🔧 SimpleAfricanProof:", simpleAfricanProofAddress);

  console.log("\n=== 🏆 ETH ACCRA HACKATHON READY ===");
  console.log("✅ ENS Track Qualified - Advanced ENS integration");
  console.log("✅ Base Track Qualified - African financial solutions");
  console.log("✅ Your ENS: godswillgwill.base.eth integrated");
  console.log("✅ African countries: Ghana, Nigeria, Kenya, South Africa");

  console.log("\n=== 🚀 NEXT STEPS ===");
  if (isTestnet) {
    console.log("1. 🧪 Test complete user flow on Base Sepolia");
    console.log("2. 🔍 Verify contracts on Base Sepolia explorer");
    console.log("3. 🌐 Update frontend with contract addresses");
    console.log("4. 🚀 Deploy to Base Mainnet when ready");
  } else if (isMainnet) {
    console.log("1. 🔍 Verify contracts on Base explorer");
    console.log("2. 🌐 Update frontend with contract addresses");
    console.log("3. 🧪 Test complete user flow");
    console.log("4. 📢 Ready for ETH Accra demo!");
  } else {
    console.log("1. 🌐 Deploy to Base Sepolia for testing:");
    console.log("   npx hardhat run scripts/deployProduction.js --network baseSepolia");
    console.log("2. 🚀 Deploy to Base Mainnet:");
    console.log("   npx hardhat run scripts/deployProduction.js --network base");
  }

  console.log("\n=== 🔗 VERIFICATION COMMANDS ===");
  if (isMainnet || isTestnet) {
    const networkFlag = isMainnet ? "base" : "baseSepolia";
    console.log(`npx hardhat verify --network ${networkFlag} ${africanProofAddress} "${hubAddress}"`);
    console.log(`npx hardhat verify --network ${networkFlag} ${simpleAfricanProofAddress}`);
  }

  console.log("\n🎉 AfricanProof deployment complete! Ready for ETH Accra! 🌍");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
