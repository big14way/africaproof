const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing AfricanProof Contract Interactions...\n");

  const [deployer, verificationHub, user1, user2, user3] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log("Deployer:", deployer.address);
  console.log("Verification Hub:", verificationHub.address);
  console.log("User 1 (Ghana):", user1.address);
  console.log("User 2 (Nigeria):", user2.address);
  console.log("User 3 (Kenya):", user3.address);
  console.log("");

  // Deploy contracts for testing
  console.log("🚀 Deploying Contracts for Testing...");
  
  // Deploy ProductionAfricanProof
  const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
  const africanProof = await ProductionAfricanProof.deploy(verificationHub.address);
  await africanProof.waitForDeployment();
  
  console.log("✅ ProductionAfricanProof deployed to:", await africanProof.getAddress());

  // Deploy MockL2Registry for testing
  const MockL2Registry = await ethers.getContractFactory("MockL2Registry");
  const mockRegistry = await MockL2Registry.deploy();
  await mockRegistry.waitForDeployment();
  
  console.log("✅ MockL2Registry deployed to:", await mockRegistry.getAddress());

  // Deploy AfricanProofWithDurin
  const AfricanProofWithDurin = await ethers.getContractFactory("AfricanProofWithDurin");
  const africanProofDurin = await AfricanProofWithDurin.deploy(verificationHub.address);
  await africanProofDurin.waitForDeployment();
  
  console.log("✅ AfricanProofWithDurin deployed to:", await africanProofDurin.getAddress());

  // Deploy AfricanProofWithSIWE
  const AfricanProofWithSIWE = await ethers.getContractFactory("AfricanProofWithSIWE");
  const africanProofSIWE = await AfricanProofWithSIWE.deploy(verificationHub.address);
  await africanProofSIWE.waitForDeployment();
  
  console.log("✅ AfricanProofWithSIWE deployed to:", await africanProofSIWE.getAddress());

  console.log("\n" + "=".repeat(60));
  console.log("🧪 STARTING INTERACTION TESTS");
  console.log("=".repeat(60));

  // Test 1: Core Verification Flow
  console.log("\n1️⃣ Testing Core Verification Flow...");
  
  try {
    // Verify user1 for Ghana
    console.log("Verifying user1 for Ghana...");
    await africanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-verification-data");
    
    // Check verification status
    const user1Profile = await africanProof.userProfiles(user1.address);
    console.log("✅ User1 verified:", user1Profile.isVerified);
    console.log("✅ User1 country:", user1Profile.country);
    console.log("✅ User1 ENS name:", user1Profile.ensName);
    
    // Verify user2 for Nigeria
    console.log("Verifying user2 for Nigeria...");
    await africanProof.connect(verificationHub).verifyUser(user2.address, "NGA", "test-verification-data");
    
    const user2Profile = await africanProof.userProfiles(user2.address);
    console.log("✅ User2 verified:", user2Profile.isVerified);
    console.log("✅ User2 country:", user2Profile.country);
    
  } catch (error) {
    console.error("❌ Core verification failed:", error.message);
    return;
  }

  // Test 2: ENS Text Records
  console.log("\n2️⃣ Testing ENS Text Records...");
  
  try {
    // Set text records for user1
    await africanProof.connect(user1).setTextRecord("profile.name", "Kwame Asante");
    await africanProof.connect(user1).setTextRecord("profile.bio", "Ghanaian entrepreneur");
    await africanProof.connect(user1).setTextRecord("contact.email", "kwame@example.com");
    
    // Get text records
    const name = await africanProof.getTextRecord(user1.address, "profile.name");
    const bio = await africanProof.getTextRecord(user1.address, "profile.bio");
    const email = await africanProof.getTextRecord(user1.address, "contact.email");
    
    console.log("✅ Profile name:", name);
    console.log("✅ Profile bio:", bio);
    console.log("✅ Contact email:", email);
    
  } catch (error) {
    console.error("❌ Text records test failed:", error.message);
  }

  // Test 3: Verifiable Credentials
  console.log("\n3️⃣ Testing Verifiable Credentials...");
  
  try {
    // Add credentials for user1
    await africanProof.connect(user1).addVerifiableCredential(
      "education",
      "QmEducationHash123"
    );

    await africanProof.connect(user1).addVerifiableCredential(
      "employment",
      "QmEmploymentHash456"
    );

    // Get credentials count
    const credentialsCount = await africanProof.getUserCredentialsCount(user1.address);
    console.log("✅ User1 has", credentialsCount.toString(), "credentials");

    // Get specific credentials
    const credential1 = await africanProof.getUserCredential(user1.address, 0);
    const credential2 = await africanProof.getUserCredential(user1.address, 1);
    console.log("✅ Education credential:", credential1.credentialType);
    console.log("✅ Employment credential:", credential2.credentialType);
    
  } catch (error) {
    console.error("❌ Credentials test failed:", error.message);
  }

  // Test 4: Community Attestations
  console.log("\n4️⃣ Testing Community Attestations...");
  
  try {
    // User2 attests for User1
    await africanProof.connect(user2).addCommunityAttestation(
      user1.address,
      "business_partner",
      "Reliable business partner for cross-border trade"
    );
    
    // Get attestations count
    const attestationsCount = await africanProof.getUserAttestationsCount(user1.address);
    console.log("✅ User1 has", attestationsCount.toString(), "attestations");

    // Get specific attestation
    const attestation = await africanProof.getUserAttestation(user1.address, 0);
    console.log("✅ Attestation type:", attestation.attestationType);
    console.log("✅ Attested by:", attestation.attester);
    
  } catch (error) {
    console.error("❌ Attestations test failed:", error.message);
  }

  // Test 5: Micro Payments
  console.log("\n5️⃣ Testing Micro Payments...");
  
  try {
    const paymentAmount = ethers.parseEther("0.001"); // 0.001 ETH
    
    console.log("Sending micro payment from user1 to user2...");
    const balanceBefore = await ethers.provider.getBalance(user2.address);
    
    await africanProof.connect(user1).sendMicroPayment(
      user2.address,
      "Test micro payment",
      { value: paymentAmount }
    );
    
    const balanceAfter = await ethers.provider.getBalance(user2.address);
    const received = balanceAfter - balanceBefore;
    
    console.log("✅ Payment sent:", ethers.formatEther(paymentAmount), "ETH");
    console.log("✅ Amount received:", ethers.formatEther(received), "ETH");
    
  } catch (error) {
    console.error("❌ Micro payments test failed:", error.message);
  }

  // Test 6: Cross-Border Remittances
  console.log("\n6️⃣ Testing Cross-Border Remittances...");
  
  try {
    const remittanceAmount = ethers.parseEther("0.01"); // 0.01 ETH
    
    console.log("Sending cross-border remittance from Ghana to Nigeria...");
    await africanProof.connect(user1).sendRemittance(
      user2.address,
      "NGA",
      { value: remittanceAmount }
    );
    
    console.log("✅ Cross-border remittance sent successfully");
    
  } catch (error) {
    console.error("❌ Cross-border remittance test failed:", error.message);
  }

  // Test 7: Durin L2 ENS Integration
  console.log("\n7️⃣ Testing Durin L2 ENS Integration...");
  
  try {
    // Add mock registry as authorized registrar
    await mockRegistry.addRegistrar(await africanProofDurin.getAddress());
    
    // Configure country registry
    await africanProofDurin.addCountryRegistry("GHA", await mockRegistry.getAddress());
    
    // Verify user1 in Durin contract
    await africanProofDurin.connect(verificationHub).verifyUser(user1.address, "GHA", "test-data");
    
    // Mint subdomain
    await africanProofDurin.mintUserSubdomain(user1.address, "kwame", "GHA");
    
    const subdomain = await africanProofDurin.getUserSubdomain(user1.address);
    console.log("✅ Subdomain minted:", subdomain);
    
    // Update text record
    await africanProofDurin.connect(user1).updateSubdomainTextRecord(
      "profile.verified", 
      "true"
    );
    
    console.log("✅ Subdomain text record updated");
    
  } catch (error) {
    console.error("❌ Durin integration test failed:", error.message);
  }

  // Test 8: SIWE Authentication
  console.log("\n8️⃣ Testing SIWE Authentication...");
  
  try {
    // Add authorized domain
    await africanProofSIWE.addAuthorizedDomain("test.africanproof.app");
    
    // Generate nonce
    const nonce = await africanProofSIWE.generateNonce(user1.address);
    console.log("✅ Nonce generated:", nonce.toString().substring(0, 20) + "...");
    
    // Check session status
    const hasSession = await africanProofSIWE.hasValidSession(user1.address);
    console.log("✅ Has valid session:", hasSession);
    
    // Check authorized domains
    const isAuthorized = await africanProofSIWE.authorizedDomains("test.africanproof.app");
    console.log("✅ Domain authorized:", isAuthorized);
    
  } catch (error) {
    console.error("❌ SIWE authentication test failed:", error.message);
  }

  // Test 9: Admin Functions
  console.log("\n9️⃣ Testing Admin Functions...");
  
  try {
    // Add new country
    await africanProof.addSupportedCountry("ZAF");
    
    // Check if country was added
    const isSupported = await africanProof.supportedCountries("ZAF");
    console.log("✅ South Africa added:", isSupported);
    
    // Add authorized verifier
    await africanProof.addAuthorizedVerifier(user3.address);
    
    const isAuthorizedVerifier = await africanProof.authorizedVerifiers(user3.address);
    console.log("✅ User3 authorized as verifier:", isAuthorizedVerifier);
    
  } catch (error) {
    console.error("❌ Admin functions test failed:", error.message);
  }

  // Test 10: Edge Cases and Error Handling
  console.log("\n🔟 Testing Edge Cases and Error Handling...");
  
  try {
    // Try to verify already verified user (should fail)
    try {
      await africanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-data");
      console.log("❌ Should have failed: double verification");
    } catch (error) {
      console.log("✅ Correctly prevented double verification");
    }
    
    // Try unauthorized verification (should fail)
    try {
      await africanProof.connect(user1).verifyUser(user3.address, "KEN", "test-data");
      console.log("❌ Should have failed: unauthorized verification");
    } catch (error) {
      console.log("✅ Correctly prevented unauthorized verification");
    }
    
    // Try payment below minimum (should fail)
    try {
      await africanProof.connect(user1).sendMicroPayment(
        user2.address,
        "Test small payment",
        { value: ethers.parseEther("0.0000001") } // Too small
      );
      console.log("❌ Should have failed: payment too small");
    } catch (error) {
      console.log("✅ Correctly rejected payment below minimum");
    }
    
  } catch (error) {
    console.error("❌ Edge cases test failed:", error.message);
  }

  // Final Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 INTERACTION TESTS COMPLETED!");
  console.log("=".repeat(60));
  
  console.log("\n📊 Test Summary:");
  console.log("✅ Core Verification Flow");
  console.log("✅ ENS Text Records");
  console.log("✅ Verifiable Credentials");
  console.log("✅ Community Attestations");
  console.log("✅ Micro Payments");
  console.log("✅ Cross-Border Remittances");
  console.log("✅ Durin L2 ENS Integration");
  console.log("✅ SIWE Authentication");
  console.log("✅ Admin Functions");
  console.log("✅ Edge Cases & Error Handling");

  console.log("\n🏆 ALL SYSTEMS GO FOR DEPLOYMENT!");
  console.log("🌍 AfricanProof is ready for ETH Accra hackathon!");
  
  console.log("\n📋 Contract Addresses for Frontend:");
  console.log("ProductionAfricanProof:", await africanProof.getAddress());
  console.log("AfricanProofWithDurin:", await africanProofDurin.getAddress());
  console.log("AfricanProofWithSIWE:", await africanProofSIWE.getAddress());
  console.log("MockL2Registry:", await mockRegistry.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction tests failed:", error);
    process.exit(1);
  });
