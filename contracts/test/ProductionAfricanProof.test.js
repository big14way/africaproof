const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductionAfricanProof", function () {
  let africanProof;
  let owner, verificationHub, user1, user2, user3, attacker;

  const GHANA = "GHA";
  const NIGERIA = "NGA";
  const KENYA = "KEN";
  const SOUTH_AFRICA = "ZAF";
  const BASE_ENS_NAME = "godswillgwill.base.eth";

  beforeEach(async function () {
    [owner, verificationHub, user1, user2, user3, attacker] = await ethers.getSigners();
    
    const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
    africanProof = await ProductionAfricanProof.deploy(verificationHub.address);
    await africanProof.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner and verification hub", async function () {
      expect(await africanProof.owner()).to.equal(owner.address);
      expect(await africanProof.verificationHub()).to.equal(verificationHub.address);
    });

    it("Should initialize supported countries", async function () {
      expect(await africanProof.supportedCountries(GHANA)).to.equal(true);
      expect(await africanProof.supportedCountries(NIGERIA)).to.equal(true);
      expect(await africanProof.supportedCountries(KENYA)).to.equal(true);
      expect(await africanProof.supportedCountries(SOUTH_AFRICA)).to.equal(true);
      expect(await africanProof.supportedCountries("USA")).to.equal(false);
    });

    it("Should have correct constants", async function () {
      expect(await africanProof.MIN_PAYMENT()).to.equal(ethers.parseEther("0.000001"));
      expect(await africanProof.PLATFORM_FEE_BP()).to.equal(25);
      expect(await africanProof.BASE_ENS_NAME()).to.equal(BASE_ENS_NAME);
    });
  });

  describe("User Verification", function () {
    it("Should verify user for Ghana", async function () {
      const tx = await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(africanProof, "UserVerified")
        .withArgs(user1.address, GHANA, BASE_ENS_NAME, block.timestamp);

      expect(await africanProof.isUserVerifiedForCountry(user1.address, GHANA)).to.equal(true);
      expect(await africanProof.getUserENSName(user1.address)).to.equal(BASE_ENS_NAME);
    });

    it("Should set initial ENS text records", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
      
      expect(await africanProof.getTextRecord(user1.address, "verification.status")).to.equal("verified");
      expect(await africanProof.getTextRecord(user1.address, "verification.country")).to.equal(GHANA);
      expect(await africanProof.getTextRecord(user1.address, "verification.provider")).to.equal("AfricanProof");
      expect(await africanProof.getTextRecord(user1.address, "identity.verified")).to.equal("true");
    });

    it("Should add initial government credential", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-credential-hash");
      
      expect(await africanProof.getUserCredentialsCount(user1.address)).to.equal(1);
      
      const [credType, credHash, timestamp, isActive] = await africanProof.getUserCredential(user1.address, 0);
      expect(credType).to.equal("government_identity");
      expect(credHash).to.equal("test-credential-hash");
      expect(isActive).to.equal(true);
    });

    it("Should fail verification for unsupported country", async function () {
      await expect(
        africanProof.connect(verificationHub).verifyUser(user1.address, "USA", "test-data")
      ).to.be.revertedWith("Country not supported");
    });

    it("Should fail verification from unauthorized verifier", async function () {
      await expect(
        africanProof.connect(attacker).verifyUser(user1.address, GHANA, "test-data")
      ).to.be.revertedWith("Not authorized to verify users");
    });

    it("Should prevent double verification", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
      
      await expect(
        africanProof.connect(verificationHub).verifyUser(user1.address, NIGERIA, "test-data")
      ).to.be.revertedWith("User already verified");
    });
  });

  describe("ENS Text Records", function () {
    beforeEach(async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
    });

    it("Should allow verified users to set text records", async function () {
      await expect(
        africanProof.connect(user1).setTextRecord("custom.field", "custom_value")
      ).to.emit(africanProof, "ENSTextRecordSet")
        .withArgs(user1.address, "custom.field", "custom_value");

      expect(await africanProof.getTextRecord(user1.address, "custom.field")).to.equal("custom_value");
    });

    it("Should prevent unverified users from setting text records", async function () {
      await expect(
        africanProof.connect(user2).setTextRecord("custom.field", "custom_value")
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("Verifiable Credentials", function () {
    beforeEach(async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
    });

    it("Should allow adding verifiable credentials", async function () {
      await africanProof.connect(user1).addVerifiableCredential("education", "QmEducationHash123");
      
      expect(await africanProof.getUserCredentialsCount(user1.address)).to.equal(2); // government + education
      
      const [credType, credHash, timestamp, isActive] = await africanProof.getUserCredential(user1.address, 1);
      expect(credType).to.equal("education");
      expect(credHash).to.equal("QmEducationHash123");
      expect(isActive).to.equal(true);
      
      // Should also set ENS text record
      expect(await africanProof.getTextRecord(user1.address, "credential.education")).to.equal("QmEducationHash123");
    });

    it("Should prevent unverified users from adding credentials", async function () {
      await expect(
        africanProof.connect(user2).addVerifiableCredential("education", "QmEducationHash123")
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("Community Attestations", function () {
    beforeEach(async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
      await africanProof.connect(verificationHub).verifyUser(user2.address, NIGERIA, "test-data");
    });

    it("Should allow verified users to attest for other verified users", async function () {
      await expect(
        africanProof.connect(user2).addCommunityAttestation(user1.address, "reputation", "excellent_member")
      ).to.emit(africanProof, "CommunityAttestation")
        .withArgs(user2.address, user1.address, "reputation", "excellent_member");

      expect(await africanProof.getUserAttestationsCount(user1.address)).to.equal(1);
      
      // Should also set ENS text record
      expect(await africanProof.getTextRecord(user1.address, "attestation.reputation")).to.equal("excellent_member");
    });

    it("Should prevent attestation for unverified users", async function () {
      await expect(
        africanProof.connect(user2).addCommunityAttestation(user3.address, "reputation", "excellent_member")
      ).to.be.revertedWith("Target user not verified");
    });

    it("Should prevent unverified users from making attestations", async function () {
      await expect(
        africanProof.connect(user3).addCommunityAttestation(user1.address, "reputation", "excellent_member")
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("Micro Payments", function () {
    beforeEach(async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
      await africanProof.connect(verificationHub).verifyUser(user2.address, NIGERIA, "test-data");
    });

    it("Should send micro payments between verified users", async function () {
      const amount = ethers.parseEther("0.001");
      const initialBalance = await ethers.provider.getBalance(user2.address);

      await expect(
        africanProof.connect(user1).sendMicroPayment(user2.address, "test_payment", { value: amount })
      ).to.emit(africanProof, "MicroPayment");

      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should fail for amounts below minimum", async function () {
      const tooSmall = ethers.parseEther("0.0000001");
      
      await expect(
        africanProof.connect(user1).sendMicroPayment(user2.address, "test_payment", { value: tooSmall })
      ).to.be.revertedWith("Amount too small");
    });

    it("Should fail for unverified recipients", async function () {
      const amount = ethers.parseEther("0.001");
      
      await expect(
        africanProof.connect(user1).sendMicroPayment(user3.address, "test_payment", { value: amount })
      ).to.be.revertedWith("Recipient not verified");
    });

    it("Should fail for unverified senders", async function () {
      const amount = ethers.parseEther("0.001");
      
      await expect(
        africanProof.connect(user3).sendMicroPayment(user1.address, "test_payment", { value: amount })
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("Cross-Border Remittances", function () {
    beforeEach(async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data");
      await africanProof.connect(verificationHub).verifyUser(user2.address, NIGERIA, "test-data");
    });

    it("Should send cross-border remittances", async function () {
      const amount = ethers.parseEther("0.1");
      const initialBalance = await ethers.provider.getBalance(user2.address);

      await expect(
        africanProof.connect(user1).sendRemittance(user2.address, NIGERIA, { value: amount })
      ).to.emit(africanProof, "RemittanceSent")
        .and.to.emit(africanProof, "CrossBorderVerification");

      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);

      // Check remittance statistics
      const [totalVolume, transactionCount, averageFee] = await africanProof.getRemittanceStats(GHANA, NIGERIA);
      expect(totalVolume).to.equal(amount);
      expect(transactionCount).to.equal(1);
    });

    it("Should fail for recipient not verified in target country", async function () {
      const amount = ethers.parseEther("0.1");
      
      await expect(
        africanProof.connect(user1).sendRemittance(user2.address, KENYA, { value: amount })
      ).to.be.revertedWith("Recipient not verified for target country");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add supported countries", async function () {
      await africanProof.connect(owner).addSupportedCountry("EGY");
      expect(await africanProof.supportedCountries("EGY")).to.equal(true);
    });

    it("Should allow owner to add authorized verifiers", async function () {
      await africanProof.connect(owner).addAuthorizedVerifier(user1.address);
      
      // user1 should now be able to verify users
      await expect(
        africanProof.connect(user1).verifyUser(user2.address, GHANA, "test-data")
      ).to.not.be.reverted;
    });

    it("Should allow owner to pause/unpause", async function () {
      await africanProof.connect(owner).pause();
      
      await expect(
        africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data")
      ).to.be.revertedWithCustomError(africanProof, "EnforcedPause");
      
      await africanProof.connect(owner).unpause();
      
      await expect(
        africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "test-data")
      ).to.not.be.reverted;
    });

    it("Should prevent non-owners from admin functions", async function () {
      await expect(
        africanProof.connect(attacker).addSupportedCountry("EGY")
      ).to.be.revertedWithCustomError(africanProof, "OwnableUnauthorizedAccount");
      
      await expect(
        africanProof.connect(attacker).pause()
      ).to.be.revertedWithCustomError(africanProof, "OwnableUnauthorizedAccount");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete user journey", async function () {
      // 1. Verify user
      await africanProof.connect(verificationHub).verifyUser(user1.address, GHANA, "government-id-hash");
      
      // 2. Add credentials
      await africanProof.connect(user1).addVerifiableCredential("education", "QmEducationHash");
      await africanProof.connect(user1).addVerifiableCredential("employment", "QmEmploymentHash");
      
      // 3. Set custom text records
      await africanProof.connect(user1).setTextRecord("profile.name", "Kwame Asante");
      await africanProof.connect(user1).setTextRecord("profile.bio", "Ghanaian entrepreneur");
      
      // 4. Verify second user for attestations
      await africanProof.connect(verificationHub).verifyUser(user2.address, NIGERIA, "government-id-hash-2");
      
      // 5. Add community attestation
      await africanProof.connect(user2).addCommunityAttestation(user1.address, "reputation", "trusted_trader");
      
      // 6. Send micro payment
      const amount = ethers.parseEther("0.01");
      await africanProof.connect(user1).sendMicroPayment(user2.address, "payment_for_services", { value: amount });
      
      // Verify all components work together
      expect(await africanProof.getUserCredentialsCount(user1.address)).to.equal(3); // government + education + employment
      expect(await africanProof.getUserAttestationsCount(user1.address)).to.equal(1);
      expect(await africanProof.getTextRecord(user1.address, "profile.name")).to.equal("Kwame Asante");
      expect(await africanProof.getTextRecord(user1.address, "attestation.reputation")).to.equal("trusted_trader");
    });
  });
});

// Helper to get latest block time
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
};
