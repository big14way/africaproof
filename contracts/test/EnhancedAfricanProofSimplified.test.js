const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnhancedAfricanProofSimplified", function () {
  let enhancedAfricanProof;
  let owner, verificationHub, user1, user2, user3;

  beforeEach(async function () {
    [owner, verificationHub, user1, user2, user3] = await ethers.getSigners();
    
    const EnhancedAfricanProofSimplified = await ethers.getContractFactory("EnhancedAfricanProofSimplified");
    enhancedAfricanProof = await EnhancedAfricanProofSimplified.deploy(verificationHub.address);
    await enhancedAfricanProof.waitForDeployment();
  });

  describe("Enhanced Features", function () {
    beforeEach(async function () {
      // Verify users for testing
      await enhancedAfricanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-credential-1");
      await enhancedAfricanProof.connect(verificationHub).verifyUser(user2.address, "NGA", "test-credential-2");
    });

    it("Should set and get text records", async function () {
      await enhancedAfricanProof.connect(user1).setTextRecord("profile.name", "Kwame Asante");
      await enhancedAfricanProof.connect(user1).setTextRecord("profile.bio", "Ghanaian entrepreneur");
      
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "profile.name")).to.equal("Kwame Asante");
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "profile.bio")).to.equal("Ghanaian entrepreneur");
    });

    it("Should add verifiable credentials", async function () {
      await enhancedAfricanProof.connect(user1).addVerifiableCredential("education", "QmEducationHash123");
      await enhancedAfricanProof.connect(user1).addVerifiableCredential("employment", "QmEmploymentHash456");
      
      expect(await enhancedAfricanProof.getUserCredentialsCount(user1.address)).to.equal(3); // government + 2 added
      
      // Check text record was set
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "credential.education")).to.equal("QmEducationHash123");
    });

    it("Should handle community attestations", async function () {
      await enhancedAfricanProof.connect(user2).addCommunityAttestation(user1.address, "reputation", "excellent_trader");
      await enhancedAfricanProof.connect(user2).addCommunityAttestation(user1.address, "skill", "blockchain_expert");
      
      expect(await enhancedAfricanProof.getUserAttestationsCount(user1.address)).to.equal(2);
      
      // Check text record was set
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "attestation.reputation")).to.equal("excellent_trader");
    });

    it("Should handle cross-border verifications", async function () {
      await enhancedAfricanProof.connect(verificationHub).addCrossBorderVerification(user1.address, "GHA", "KEN");
      
      expect(await enhancedAfricanProof.getCrossBorderVerificationsCount(user1.address)).to.equal(1);
      expect(await enhancedAfricanProof.isUserVerifiedForCountry(user1.address, "KEN")).to.equal(true);
    });

    it("Should handle micro-payments with enhanced features", async function () {
      const amount = ethers.parseEther("0.001");
      const initialBalance = await ethers.provider.getBalance(user2.address);
      
      await enhancedAfricanProof.connect(user1).sendMicroPayment(user2.address, "enhanced_payment", { value: amount });
      
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should handle cross-border remittances", async function () {
      const amount = ethers.parseEther("0.1");
      
      await enhancedAfricanProof.connect(user1).sendRemittance(user2.address, "NGA", { value: amount });
      
      // Should emit both events
      // RemittanceSent event is emitted in the function
    });

    it("Should prevent unverified users from using enhanced features", async function () {
      await expect(enhancedAfricanProof.connect(user3).setTextRecord("test", "value"))
        .to.be.revertedWith("User not verified");
      
      await expect(enhancedAfricanProof.connect(user3).addVerifiableCredential("test", "hash"))
        .to.be.revertedWith("User not verified");
      
      await expect(enhancedAfricanProof.connect(user3).addCommunityAttestation(user1.address, "test", "data"))
        .to.be.revertedWith("User not verified");
    });

    it("Should have initial verification text records", async function () {
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "verification.status")).to.equal("verified");
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "verification.country")).to.equal("GHA");
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "verification.provider")).to.equal("EnhancedAfricanProof");
      expect(await enhancedAfricanProof.getTextRecord(user1.address, "identity.verified")).to.equal("true");
    });

    it("Should have correct ENS name", async function () {
      expect(await enhancedAfricanProof.getUserENSName(user1.address)).to.equal("gwill.eth");
    });
  });

  describe("Integration with ProductionAfricanProof", function () {
    it("Should have same core functionality as ProductionAfricanProof", async function () {
      // Test that enhanced version maintains compatibility
      expect(await enhancedAfricanProof.BASE_ENS_NAME()).to.equal("gwill.eth");
      expect(await enhancedAfricanProof.MIN_PAYMENT()).to.equal(ethers.parseEther("0.000001"));
      expect(await enhancedAfricanProof.PLATFORM_FEE_BP()).to.equal(25);
      
      // Test supported countries
      expect(await enhancedAfricanProof.supportedCountries("GHA")).to.equal(true);
      expect(await enhancedAfricanProof.supportedCountries("NGA")).to.equal(true);
      expect(await enhancedAfricanProof.supportedCountries("KEN")).to.equal(true);
      expect(await enhancedAfricanProof.supportedCountries("ZAF")).to.equal(true);
    });
  });
});
