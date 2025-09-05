const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Complete AfricanProof ENS Ecosystem Integration...\n");

  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  const isTestnet = networkName.includes("sepolia") || networkName.includes("goerli") || networkName === "localhost";

  console.log("📋 Deployment Configuration:");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Is Testnet:", isTestnet);
  console.log("");

  // Configuration for Base Sepolia (your setup)
  const REGISTRY_ADDRESS = "0xe815db6ab1a0c7dc201cbd1dd9ea9498ffd634cc";
  const VERIFICATION_HUB = deployer.address; // Using deployer as verification hub for demo

  // Step 1: Deploy AfricanProofWithEFP (complete integration)
  console.log("1️⃣ Deploying AfricanProofWithEFP...");
  const AfricanProofWithEFP = await ethers.getContractFactory("AfricanProofWithEFP");
  const africanProofEFP = await AfricanProofWithEFP.deploy(VERIFICATION_HUB);
  await africanProofEFP.waitForDeployment();
  
  const africanProofEFPAddress = await africanProofEFP.getAddress();
  console.log("✅ AfricanProofWithEFP deployed to:", africanProofEFPAddress);

  // Step 2: Configure country registries
  console.log("\n2️⃣ Configuring Country Registries...");
  const countries = [
    { code: "GHA", name: "Ghana" },
    { code: "NGA", name: "Nigeria" },
    { code: "KEN", name: "Kenya" },
    { code: "ZAF", name: "South Africa" },
    { code: "EGY", name: "Egypt" }
  ];

  for (const country of countries) {
    console.log(`Adding registry for ${country.name} (${country.code})...`);
    await africanProofEFP.addCountryRegistry(country.code, REGISTRY_ADDRESS);
    console.log(`✅ ${country.name} registry configured`);
  }

  // Step 3: Configure SIWE domains
  console.log("\n3️⃣ Configuring SIWE Authorized Domains...");
  const domains = [
    "africanproof.app",
    "www.africanproof.app",
    isTestnet ? "localhost:3000" : null,
    isTestnet ? "127.0.0.1:3000" : null
  ].filter(Boolean);

  for (const domain of domains) {
    console.log(`Adding authorized domain: ${domain}`);
    await africanProofEFP.addAuthorizedDomain(domain);
    console.log(`✅ Domain ${domain} authorized`);
  }

  // Step 4: Verify deployment
  console.log("\n4️⃣ Verifying Deployment...");
  
  // Check basic functionality
  const ensName = await africanProofEFP.BASE_ENS_NAME();
  const chainId = await africanProofEFP.chainId();
  const coinType = await africanProofEFP.coinType();
  
  console.log("ENS Name:", ensName);
  console.log("Chain ID:", chainId.toString());
  console.log("Coin Type:", coinType.toString());
  
  // Check country registries
  for (const country of countries) {
    const registry = await africanProofEFP.getCountryRegistry(country.code);
    console.log(`${country.name} registry:`, registry);
  }

  // Check supported industries
  const industries = await africanProofEFP.getSupportedIndustries();
  console.log("Supported Industries:", industries.slice(0, 5), "...");

  // Step 5: Save deployment information
  console.log("\n5️⃣ Saving Deployment Information...");
  
  const deploymentInfo = {
    network: networkName,
    chainId: chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    deployerBalance: ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    contracts: {
      AfricanProofWithEFP: {
        address: africanProofEFPAddress,
        ensName: "gwill.eth",
        registryAddress: REGISTRY_ADDRESS,
        features: [
          "Durin L2 ENS Subdomains",
          "SIWE Authentication",
          "EFP Professional Networking",
          "Cross-border Trade Connections",
          "Industry Networks",
          "All ProductionAfricanProof features"
        ]
      }
    },
    configuration: {
      verificationHub: VERIFICATION_HUB,
      registryAddress: REGISTRY_ADDRESS,
      supportedCountries: countries.map(c => c.code),
      authorizedDomains: domains,
      ensName: "gwill.eth",
      minPayment: "0.000001 ETH",
      platformFee: "0.25%"
    },
    ethAccraHackathon: {
      ensTrack: {
        qualified: true,
        features: [
          "Hierarchical ENS identity (kwame.ghana.gwill.eth)",
          "L2 subdomain minting via Durin",
          "Rich text records for credentials",
          "SIWE standard authentication",
          "Professional networking via EFP",
          "Cross-border trade facilitation"
        ]
      },
      baseTrack: {
        qualified: true,
        features: [
          "African financial inclusion",
          "Sub-cent payments on Base",
          "Cross-border remittances",
          "Community-driven verification",
          "Professional networking",
          "Real-world problem solving"
        ]
      }
    }
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}-complete.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  const latestFile = path.join(deploymentsDir, "latest-complete.json");
  fs.writeFileSync(latestFile, JSON.stringify({
    network: networkName,
    completeContract: africanProofEFPAddress,
    registryAddress: REGISTRY_ADDRESS,
    ensName: "gwill.eth",
    verificationHub: VERIFICATION_HUB,
    deployedAt: deploymentInfo.deployedAt,
    deployer: deployer.address
  }, null, 2));

  // Step 6: Display final results
  console.log("\n" + "=".repeat(60));
  console.log("🎉 COMPLETE AFRICANPROOF ENS ECOSYSTEM DEPLOYED!");
  console.log("=".repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("🔧 AfricanProofWithEFP:", africanProofEFPAddress);
  console.log("🏛️ L2 Registry:", REGISTRY_ADDRESS);
  console.log("🔐 Verification Hub:", VERIFICATION_HUB);

  console.log("\n🌍 Supported Countries:");
  countries.forEach(country => {
    console.log(`  ${country.name} (${country.code})`);
  });

  console.log("\n🔗 ENS Integration:");
  console.log("✅ Base ENS Name: gwill.eth");
  console.log("✅ Durin L2 Subdomains: Enabled");
  console.log("✅ SIWE Authentication: Configured");
  console.log("✅ EFP Networking: Ready");

  console.log("\n🏆 ETH ACCRA HACKATHON READY:");
  console.log("✅ ENS Track: QUALIFIED - Advanced integration beyond name resolution");
  console.log("✅ Base Track: QUALIFIED - African financial inclusion solutions");

  console.log("\n🚀 NEXT STEPS:");
  if (isTestnet) {
    console.log("1. 🧪 Test complete user flow on Base Sepolia");
    console.log("2. 🔗 Integrate with frontend application");
    console.log("3. 🎯 Deploy to Base Mainnet for production");
    console.log("4. 🎪 Demo at ETH Accra hackathon");
  } else {
    console.log("1. 🎯 Production deployment complete!");
    console.log("2. 🔗 Update frontend with new contract address");
    console.log("3. 🎪 Ready for ETH Accra demo!");
  }

  console.log("\n📖 Demo User Journey:");
  console.log("1. User signs in with SIWE (gwill.eth)");
  console.log("2. Verify identity for Ghana → Get kwame.ghana.gwill.eth");
  console.log("3. Join agriculture industry network");
  console.log("4. Follow Nigerian traders for cross-border trade");
  console.log("5. Send micro-payments and remittances");
  console.log("6. Build professional reputation through connections");

  console.log("\n" + "=".repeat(60));
  console.log("🌟 AfricanProof: Connecting Africa through Web3 Identity! 🌟");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
