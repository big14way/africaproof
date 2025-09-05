const { ethers } = require("hardhat");

async function main() {
  console.log("🎪 ETH ACCRA HACKATHON DEMO FLOW");
  console.log("🌍 AfricanProof: Connecting Africa through Web3 Identity");
  console.log("=".repeat(70));

  const [deployer, verificationHub, kwame, amina, kofi] = await ethers.getSigners();
  
  console.log("\n👥 Demo Characters:");
  console.log("🇬🇭 Kwame (Ghana - Farmer):", kwame.address);
  console.log("🇳🇬 Amina (Nigeria - Trader):", amina.address);
  console.log("🇰🇪 Kofi (Kenya - Developer):", kofi.address);
  console.log("");

  // Deploy contracts
  console.log("🚀 Setting up AfricanProof Ecosystem...");
  
  const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
  const africanProof = await ProductionAfricanProof.deploy(verificationHub.address);
  await africanProof.waitForDeployment();
  
  const MockL2Registry = await ethers.getContractFactory("MockL2Registry");
  const mockRegistry = await MockL2Registry.deploy();
  await mockRegistry.waitForDeployment();
  
  const AfricanProofWithDurin = await ethers.getContractFactory("AfricanProofWithDurin");
  const africanProofDurin = await AfricanProofWithDurin.deploy(verificationHub.address);
  await africanProofDurin.waitForDeployment();
  
  const AfricanProofWithSIWE = await ethers.getContractFactory("AfricanProofWithSIWE");
  const africanProofSIWE = await AfricanProofWithSIWE.deploy(verificationHub.address);
  await africanProofSIWE.waitForDeployment();

  console.log("✅ AfricanProof ecosystem deployed!");

  // Configure system
  await mockRegistry.addRegistrar(await africanProofDurin.getAddress());
  await africanProofDurin.addCountryRegistry("GHA", await mockRegistry.getAddress());
  await africanProofDurin.addCountryRegistry("NGA", await mockRegistry.getAddress());
  await africanProofDurin.addCountryRegistry("KEN", await mockRegistry.getAddress());
  await africanProofSIWE.addAuthorizedDomain("africanproof.app");

  console.log("\n" + "=".repeat(70));
  console.log("🎬 DEMO SCENARIO: CROSS-BORDER AGRICULTURAL TRADE");
  console.log("=".repeat(70));

  // Scene 1: Identity Verification
  console.log("\n🎬 Scene 1: Identity Verification & ENS Subdomains");
  console.log("-".repeat(50));
  
  console.log("\n🇬🇭 Kwame (Ghanaian Farmer) gets verified...");
  await africanProof.connect(verificationHub).verifyUser(kwame.address, "GHA", "Ghana-ID-12345");
  await africanProofDurin.connect(verificationHub).verifyUser(kwame.address, "GHA", "Ghana-ID-12345");
  await africanProofDurin.mintUserSubdomain(kwame.address, "kwame", "GHA");
  
  const kwameSubdomain = await africanProofDurin.getUserSubdomain(kwame.address);
  console.log("✅ Kwame's ENS identity:", kwameSubdomain);
  
  console.log("\n🇳🇬 Amina (Nigerian Trader) gets verified...");
  await africanProof.connect(verificationHub).verifyUser(amina.address, "NGA", "Nigeria-ID-67890");
  await africanProofDurin.connect(verificationHub).verifyUser(amina.address, "NGA", "Nigeria-ID-67890");
  await africanProofDurin.mintUserSubdomain(amina.address, "amina", "NGA");
  
  const aminaSubdomain = await africanProofDurin.getUserSubdomain(amina.address);
  console.log("✅ Amina's ENS identity:", aminaSubdomain);

  console.log("\n🇰🇪 Kofi (Kenyan Developer) gets verified...");
  await africanProof.connect(verificationHub).verifyUser(kofi.address, "KEN", "Kenya-ID-11111");
  await africanProofDurin.connect(verificationHub).verifyUser(kofi.address, "KEN", "Kenya-ID-11111");
  await africanProofDurin.mintUserSubdomain(kofi.address, "kofi", "KEN");
  
  const kofiSubdomain = await africanProofDurin.getUserSubdomain(kofi.address);
  console.log("✅ Kofi's ENS identity:", kofiSubdomain);

  // Scene 2: Building Professional Profiles
  console.log("\n🎬 Scene 2: Building Professional Profiles");
  console.log("-".repeat(50));
  
  console.log("\n🌾 Kwame sets up his farmer profile...");
  await africanProof.connect(kwame).setTextRecord("profile.name", "Kwame Asante");
  await africanProof.connect(kwame).setTextRecord("profile.occupation", "Organic Farmer");
  await africanProof.connect(kwame).setTextRecord("profile.location", "Kumasi, Ghana");
  await africanProof.connect(kwame).setTextRecord("business.specialty", "Cocoa & Plantains");
  await africanProof.connect(kwame).setTextRecord("contact.phone", "+233-XXX-XXXX");
  
  await africanProof.connect(kwame).addVerifiableCredential(
    "certification",
    "QmOrganicFarmCert123"
  );

  console.log("✅ Kwame's farmer profile created with organic certification");

  console.log("\n🏪 Amina sets up her trader profile...");
  await africanProof.connect(amina).setTextRecord("profile.name", "Amina Bello");
  await africanProof.connect(amina).setTextRecord("profile.occupation", "Agricultural Trader");
  await africanProof.connect(amina).setTextRecord("profile.location", "Lagos, Nigeria");
  await africanProof.connect(amina).setTextRecord("business.specialty", "West African Produce Import/Export");
  await africanProof.connect(amina).setTextRecord("contact.email", "amina@tradehub.ng");
  
  await africanProof.connect(amina).addVerifiableCredential(
    "license",
    "QmTradeLicense456"
  );

  console.log("✅ Amina's trader profile created with trading license");

  console.log("\n💻 Kofi sets up his developer profile...");
  await africanProof.connect(kofi).setTextRecord("profile.name", "Kofi Mwangi");
  await africanProof.connect(kofi).setTextRecord("profile.occupation", "Blockchain Developer");
  await africanProof.connect(kofi).setTextRecord("profile.location", "Nairobi, Kenya");
  await africanProof.connect(kofi).setTextRecord("business.specialty", "DeFi & Agricultural Tech");
  await africanProof.connect(kofi).setTextRecord("contact.github", "github.com/kofi-dev");

  console.log("✅ Kofi's developer profile created");

  // Scene 3: Community Trust Building
  console.log("\n🎬 Scene 3: Community Trust Building");
  console.log("-".repeat(50));
  
  console.log("\n🤝 Building trust through community attestations...");
  
  // Kofi attests for Kwame's farming expertise
  await africanProof.connect(kofi).addCommunityAttestation(
    kwame.address,
    "farming_expertise",
    "Verified Kwame's organic farming practices through site visit"
  );
  
  // Amina attests for Kwame's product quality
  await africanProof.connect(amina).addCommunityAttestation(
    kwame.address,
    "product_quality",
    "Excellent quality cocoa beans, reliable supplier"
  );
  
  // Kwame attests for Amina's business reliability
  await africanProof.connect(kwame).addCommunityAttestation(
    amina.address,
    "business_reliability",
    "Prompt payments, fair prices, trustworthy trader"
  );

  const kwameAttestationsCount = await africanProof.getUserAttestationsCount(kwame.address);
  console.log("✅ Kwame has", kwameAttestationsCount.toString(), "community attestations");

  const aminaAttestationsCount = await africanProof.getUserAttestationsCount(amina.address);
  console.log("✅ Amina has", aminaAttestationsCount.toString(), "community attestations");

  // Scene 4: Cross-Border Trade Transaction
  console.log("\n🎬 Scene 4: Cross-Border Trade Transaction");
  console.log("-".repeat(50));
  
  console.log("\n💰 Amina purchases cocoa from Kwame...");
  
  // Trade details
  const tradeAmount = ethers.parseEther("0.5"); // 0.5 ETH for cocoa shipment
  const platformFee = tradeAmount * BigInt(25) / BigInt(10000); // 0.25% fee
  const kwameReceives = tradeAmount - platformFee;
  
  console.log("Trade Amount:", ethers.formatEther(tradeAmount), "ETH");
  console.log("Platform Fee:", ethers.formatEther(platformFee), "ETH");
  console.log("Kwame Receives:", ethers.formatEther(kwameReceives), "ETH");
  
  // Record balances before
  const kwameBalanceBefore = await ethers.provider.getBalance(kwame.address);
  const aminaBalanceBefore = await ethers.provider.getBalance(amina.address);
  
  // Execute cross-border trade payment
  await africanProof.connect(amina).sendRemittance(
    kwame.address,
    "GHA",
    { value: tradeAmount }
  );
  
  // Record balances after
  const kwameBalanceAfter = await ethers.provider.getBalance(kwame.address);
  const aminaBalanceAfter = await ethers.provider.getBalance(amina.address);
  
  const kwameGained = kwameBalanceAfter - kwameBalanceBefore;
  const aminaSpent = aminaBalanceBefore - aminaBalanceAfter;
  
  console.log("✅ Cross-border payment completed!");
  console.log("💰 Kwame received:", ethers.formatEther(kwameGained), "ETH");
  console.log("💸 Amina spent:", ethers.formatEther(aminaSpent), "ETH");

  // Scene 5: Micro-Payment for Services
  console.log("\n🎬 Scene 5: Micro-Payment for Tech Services");
  console.log("-".repeat(50));
  
  console.log("\n💻 Kwame pays Kofi for building a farm management app...");
  
  const servicePayment = ethers.parseEther("0.05"); // 0.05 ETH for app development
  
  await africanProof.connect(kwame).sendMicroPayment(
    kofi.address,
    "Farm management app development",
    { value: servicePayment }
  );
  
  console.log("✅ Service payment sent:", ethers.formatEther(servicePayment), "ETH");
  console.log("💡 Kofi can now build the farm management dApp!");

  // Scene 6: SIWE Authentication Demo
  console.log("\n🎬 Scene 6: SIWE Authentication for dApp Access");
  console.log("-".repeat(50));
  
  console.log("\n🔐 Users authenticate with SIWE for secure dApp access...");
  
  // Generate nonces for all users
  const kwameNonce = await africanProofSIWE.generateNonce(kwame.address);
  const aminaNonce = await africanProofSIWE.generateNonce(amina.address);
  const kofiNonce = await africanProofSIWE.generateNonce(kofi.address);
  
  console.log("✅ SIWE nonces generated for secure authentication");
  console.log("🔑 Kwame's nonce:", kwameNonce.toString().substring(0, 20) + "...");
  console.log("🔑 Amina's nonce:", aminaNonce.toString().substring(0, 20) + "...");
  console.log("🔑 Kofi's nonce:", kofiNonce.toString().substring(0, 20) + "...");

  // Final Summary
  console.log("\n" + "=".repeat(70));
  console.log("🎉 HACKATHON DEMO COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(70));
  
  console.log("\n📊 Demo Results:");
  console.log("✅ 3 users verified across 3 African countries");
  console.log("✅ ENS subdomains minted: kwame.gha.gwill.eth, amina.nga.gwill.eth, kofi.ken.gwill.eth");
  console.log("✅ Professional profiles with verifiable credentials");
  console.log("✅ Community trust network with attestations");
  console.log("✅ Cross-border trade payment:", ethers.formatEther(tradeAmount), "ETH");
  console.log("✅ Micro-payment for services:", ethers.formatEther(servicePayment), "ETH");
  console.log("✅ SIWE authentication ready for dApp integration");

  console.log("\n🏆 ETH ACCRA HACKATHON TRACKS:");
  console.log("✅ ENS TRACK - QUALIFIED:");
  console.log("   • Tier 1: Durin L2 subdomains + SIWE authentication");
  console.log("   • Tier 2: Professional networking with attestations");
  console.log("   • Beyond name resolution: Full identity ecosystem");
  
  console.log("✅ BASE TRACK - QUALIFIED:");
  console.log("   • African financial inclusion through Web3");
  console.log("   • Sub-cent payments enabling micro-transactions");
  console.log("   • Cross-border remittances without traditional banking");
  console.log("   • Real-world problem solving for African commerce");

  console.log("\n🌍 IMPACT DEMONSTRATION:");
  console.log("• Kwame (farmer) can now access global markets");
  console.log("• Amina (trader) has verified supplier network");
  console.log("• Kofi (developer) earns from African tech services");
  console.log("• All connected through decentralized Web3 identity");
  console.log("• Payments flow instantly across borders");
  console.log("• Trust built through community verification");

  console.log("\n🚀 READY FOR DEPLOYMENT TO BASE NETWORK!");
  console.log("🎪 AfricanProof: The future of African Web3 identity!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo flow failed:", error);
    process.exit(1);
  });
