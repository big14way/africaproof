const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying AfricanProof to Base Network...\n");

  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = await deployer.provider.getNetwork().then(n => n.chainId);

  console.log("📋 Deployment Configuration:");
  console.log("Network:", networkName);
  console.log("Chain ID:", chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Validate network
  const isBaseSepolia = chainId === 84532n;
  const isBaseMainnet = chainId === 8453n;
  
  if (!isBaseSepolia && !isBaseMainnet) {
    throw new Error(`❌ Invalid network. Expected Base Sepolia (84532) or Base Mainnet (8453), got ${chainId}`);
  }

  console.log(`✅ Deploying to ${isBaseMainnet ? 'Base Mainnet' : 'Base Sepolia'}`);

  // Configuration
  const REGISTRY_ADDRESS = "0xe815db6ab1a0c7dc201cbd1dd9ea9498ffd634cc";
  const VERIFICATION_HUB = deployer.address; // Using deployer as verification hub

  const deployedContracts = {};
  const gasUsed = {};

  // Step 1: Deploy Core ProductionAfricanProof
  console.log("\n1️⃣ Deploying ProductionAfricanProof (Core)...");
  const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
  
  console.log("Estimating gas...");
  const deployTx1 = await ProductionAfricanProof.getDeployTransaction(VERIFICATION_HUB);
  const gasEstimate1 = await ethers.provider.estimateGas(deployTx1);
  console.log("Estimated gas:", gasEstimate1.toString());

  const africanProof = await ProductionAfricanProof.deploy(VERIFICATION_HUB);
  const receipt1 = await africanProof.deploymentTransaction().wait();
  
  deployedContracts.ProductionAfricanProof = await africanProof.getAddress();
  gasUsed.ProductionAfricanProof = receipt1.gasUsed.toString();
  
  console.log("✅ ProductionAfricanProof deployed to:", deployedContracts.ProductionAfricanProof);
  console.log("Gas used:", gasUsed.ProductionAfricanProof);

  // Step 2: Deploy Durin Integration
  console.log("\n2️⃣ Deploying AfricanProofWithDurin (L2 ENS Subdomains)...");
  const AfricanProofWithDurin = await ethers.getContractFactory("AfricanProofWithDurin");
  
  console.log("Estimating gas...");
  const deployTx2 = await AfricanProofWithDurin.getDeployTransaction(VERIFICATION_HUB);
  const gasEstimate2 = await ethers.provider.estimateGas(deployTx2);
  console.log("Estimated gas:", gasEstimate2.toString());

  const africanProofDurin = await AfricanProofWithDurin.deploy(VERIFICATION_HUB);
  const receipt2 = await africanProofDurin.deploymentTransaction().wait();
  
  deployedContracts.AfricanProofWithDurin = await africanProofDurin.getAddress();
  gasUsed.AfricanProofWithDurin = receipt2.gasUsed.toString();
  
  console.log("✅ AfricanProofWithDurin deployed to:", deployedContracts.AfricanProofWithDurin);
  console.log("Gas used:", gasUsed.AfricanProofWithDurin);

  // Step 3: Deploy SIWE Integration
  console.log("\n3️⃣ Deploying AfricanProofWithSIWE (Authentication)...");
  const AfricanProofWithSIWE = await ethers.getContractFactory("AfricanProofWithSIWE");
  
  console.log("Estimating gas...");
  const deployTx3 = await AfricanProofWithSIWE.getDeployTransaction(VERIFICATION_HUB);
  const gasEstimate3 = await ethers.provider.estimateGas(deployTx3);
  console.log("Estimated gas:", gasEstimate3.toString());

  const africanProofSIWE = await AfricanProofWithSIWE.deploy(VERIFICATION_HUB);
  const receipt3 = await africanProofSIWE.deploymentTransaction().wait();
  
  deployedContracts.AfricanProofWithSIWE = await africanProofSIWE.getAddress();
  gasUsed.AfricanProofWithSIWE = receipt3.gasUsed.toString();
  
  console.log("✅ AfricanProofWithSIWE deployed to:", deployedContracts.AfricanProofWithSIWE);
  console.log("Gas used:", gasUsed.AfricanProofWithSIWE);

  // Step 4: Configure Durin Integration
  console.log("\n4️⃣ Configuring Durin L2 Registries...");
  const countries = [
    { code: "GHA", name: "Ghana" },
    { code: "NGA", name: "Nigeria" },
    { code: "KEN", name: "Kenya" },
    { code: "ZAF", name: "South Africa" },
    { code: "EGY", name: "Egypt" }
  ];

  for (const country of countries) {
    console.log(`Adding registry for ${country.name} (${country.code})...`);
    const tx = await africanProofDurin.addCountryRegistry(country.code, REGISTRY_ADDRESS);
    await tx.wait();
    console.log(`✅ ${country.name} registry configured`);
  }

  // Step 5: Configure SIWE Domains
  console.log("\n5️⃣ Configuring SIWE Authorized Domains...");
  const domains = [
    "africanproof.app",
    "www.africanproof.app",
    isBaseSepolia ? "localhost:3000" : null,
    isBaseSepolia ? "127.0.0.1:3000" : null
  ].filter(Boolean);

  for (const domain of domains) {
    console.log(`Adding authorized domain: ${domain}`);
    const tx = await africanProofSIWE.addAuthorizedDomain(domain);
    await tx.wait();
    console.log(`✅ Domain ${domain} authorized`);
  }

  // Step 6: Verify Deployments
  console.log("\n6️⃣ Verifying Deployments...");
  
  const ensName = await africanProof.BASE_ENS_NAME();
  const chainIdContract = await africanProofDurin.chainId();
  const coinType = await africanProofDurin.coinType();
  
  console.log("ENS Name:", ensName);
  console.log("Chain ID:", chainIdContract.toString());
  console.log("Coin Type:", coinType.toString());

  // Calculate total gas used
  const totalGasUsed = Object.values(gasUsed).reduce((sum, gas) => sum + BigInt(gas), 0n);
  const totalCostWei = totalGasUsed * BigInt(receipt1.gasPrice);
  const totalCostEth = ethers.formatEther(totalCostWei);

  // Step 7: Save deployment information
  console.log("\n7️⃣ Saving Deployment Information...");
  
  const deploymentInfo = {
    network: networkName,
    chainId: chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    deployerBalance: ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    totalGasUsed: totalGasUsed.toString(),
    totalCostEth: totalCostEth,
    architecture: "modular",
    contracts: {
      ProductionAfricanProof: {
        address: deployedContracts.ProductionAfricanProof,
        gasUsed: gasUsed.ProductionAfricanProof,
        purpose: "Core identity verification and payments"
      },
      AfricanProofWithDurin: {
        address: deployedContracts.AfricanProofWithDurin,
        gasUsed: gasUsed.AfricanProofWithDurin,
        purpose: "L2 ENS subdomain management",
        registryAddress: REGISTRY_ADDRESS
      },
      AfricanProofWithSIWE: {
        address: deployedContracts.AfricanProofWithSIWE,
        gasUsed: gasUsed.AfricanProofWithSIWE,
        purpose: "Sign-In With Ethereum authentication"
      }
    },
    configuration: {
      verificationHub: VERIFICATION_HUB,
      registryAddress: REGISTRY_ADDRESS,
      supportedCountries: countries.map(c => c.code),
      authorizedDomains: domains,
      ensName: "gwill.eth"
    },
    ethAccraHackathon: {
      qualified: true,
      ensTrack: "Tier 1 & 2 - Durin L2 Subdomains + SIWE + Professional Networking",
      baseTrack: "African Financial Inclusion with Sub-cent Payments"
    }
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}-production.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  const latestFile = path.join(deploymentsDir, "latest-production.json");
  fs.writeFileSync(latestFile, JSON.stringify({
    network: networkName,
    chainId: chainId.toString(),
    contracts: deployedContracts,
    registryAddress: REGISTRY_ADDRESS,
    ensName: "gwill.eth",
    deployedAt: deploymentInfo.deployedAt,
    deployer: deployer.address,
    totalCostEth: totalCostEth
  }, null, 2));

  // Step 8: Display final results
  console.log("\n" + "=".repeat(70));
  console.log("🎉 AFRICANPROOF DEPLOYED TO BASE NETWORK!");
  console.log("=".repeat(70));
  
  console.log("\n📋 Contract Addresses:");
  console.log("🔧 ProductionAfricanProof:", deployedContracts.ProductionAfricanProof);
  console.log("🏗️ AfricanProofWithDurin:", deployedContracts.AfricanProofWithDurin);
  console.log("🔐 AfricanProofWithSIWE:", deployedContracts.AfricanProofWithSIWE);
  console.log("🏛️ L2 Registry:", REGISTRY_ADDRESS);

  console.log("\n💰 Deployment Costs:");
  console.log("Total Gas Used:", totalGasUsed.toString());
  console.log("Total Cost:", totalCostEth, "ETH");

  console.log("\n🏆 ETH ACCRA HACKATHON READY:");
  console.log("✅ ENS Track: QUALIFIED - Advanced ENS ecosystem integration");
  console.log("✅ Base Track: QUALIFIED - African financial inclusion on Base");

  console.log("\n🌟 Demo URLs:");
  if (isBaseMainnet) {
    console.log("🔗 Base Explorer:", `https://basescan.org/address/${deployedContracts.ProductionAfricanProof}`);
  } else {
    console.log("🔗 Base Sepolia Explorer:", `https://sepolia.basescan.org/address/${deployedContracts.ProductionAfricanProof}`);
  }

  console.log("\n🚀 NEXT STEPS:");
  console.log("1. 🔗 Update frontend with new contract addresses");
  console.log("2. 🧪 Test complete user flows");
  console.log("3. 🎪 Prepare hackathon demo");
  console.log("4. 🌟 Show off your African Web3 identity system!");

  console.log("\n" + "=".repeat(70));
  console.log("🌍 AfricanProof: Connecting Africa through Web3! 🌍");
  console.log("=".repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
