const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductionAfricanProof - Simple Test", function () {
  let africanProof;
  let owner, verificationHub, user1, user2;

  beforeEach(async function () {
    [owner, verificationHub, user1, user2] = await ethers.getSigners();
    
    const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
    africanProof = await ProductionAfricanProof.deploy(verificationHub.address);
    await africanProof.waitForDeployment();
  });

  describe("Basic Functionality", function () {
    it("Should deploy successfully", async function () {
      expect(await africanProof.owner()).to.equal(owner.address);
      expect(await africanProof.verificationHub()).to.equal(verificationHub.address);
    });

    it("Should have correct ENS name", async function () {
      expect(await africanProof.BASE_ENS_NAME()).to.equal("godswillgwill.base.eth");
    });

    it("Should support African countries", async function () {
      expect(await africanProof.supportedCountries("GHA")).to.equal(true);
      expect(await africanProof.supportedCountries("NGA")).to.equal(true);
      expect(await africanProof.supportedCountries("KEN")).to.equal(true);
      expect(await africanProof.supportedCountries("ZAF")).to.equal(true);
    });

    it("Should verify user for Ghana", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-data");
      
      expect(await africanProof.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
      expect(await africanProof.getUserENSName(user1.address)).to.equal("godswillgwill.base.eth");
    });

    it("Should set text records", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-data");
      
      expect(await africanProof.getTextRecord(user1.address, "verification.status")).to.equal("verified");
      expect(await africanProof.getTextRecord(user1.address, "verification.country")).to.equal("GHA");
    });

    it("Should allow micro payments", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-data");
      await africanProof.connect(verificationHub).verifyUser(user2.address, "NGA", "test-data");
      
      const amount = ethers.parseEther("0.001");
      const initialBalance = await ethers.provider.getBalance(user2.address);
      
      await africanProof.connect(user1).sendMicroPayment(user2.address, "test_payment", { value: amount });
      
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should handle cross-border remittances", async function () {
      await africanProof.connect(verificationHub).verifyUser(user1.address, "GHA", "test-data");
      await africanProof.connect(verificationHub).verifyUser(user2.address, "NGA", "test-data");
      
      const amount = ethers.parseEther("0.1");
      await africanProof.connect(user1).sendRemittance(user2.address, "NGA", { value: amount });
      
      const [totalVolume, transactionCount] = await africanProof.getRemittanceStats("GHA", "NGA");
      expect(totalVolume).to.equal(amount);
      expect(transactionCount).to.equal(1);
    });
  });
});
