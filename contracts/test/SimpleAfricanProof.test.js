const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleAfricanProof", function () {
  let simpleAfricanProof;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const SimpleAfricanProof = await ethers.getContractFactory("SimpleAfricanProof");
    simpleAfricanProof = await SimpleAfricanProof.deploy();
    await simpleAfricanProof.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await simpleAfricanProof.owner()).to.equal(owner.address);
    });

    it("Should initialize supported countries", async function () {
      expect(await simpleAfricanProof.isCountrySupported("GHA")).to.equal(true);
      expect(await simpleAfricanProof.isCountrySupported("NGA")).to.equal(true);
      expect(await simpleAfricanProof.isCountrySupported("KEN")).to.equal(true);
      expect(await simpleAfricanProof.isCountrySupported("ZAF")).to.equal(true);
      expect(await simpleAfricanProof.isCountrySupported("USA")).to.equal(false);
    });
  });

  describe("User Verification", function () {
    it("Should verify user for Ghana", async function () {
      const tx = await simpleAfricanProof.verifyUser(user1.address, "GHA");
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(simpleAfricanProof, "UserVerified")
        .withArgs(user1.address, "GHA", block.timestamp);

      expect(await simpleAfricanProof.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
    });

    it("Should create ENS domain for verified user", async function () {
      await simpleAfricanProof.verifyUser(user1.address, "GHA");
      
      const domain = await simpleAfricanProof.getUserENSDomain(user1.address);
      expect(domain).to.equal("gwill.eth");
    });

    it("Should set verification timestamp", async function () {
      const tx = await simpleAfricanProof.verifyUser(user1.address, "GHA");
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;
      
      expect(await simpleAfricanProof.getVerificationTimestamp(user1.address)).to.equal(blockTimestamp);
    });

    it("Should fail to verify for unsupported country", async function () {
      await expect(simpleAfricanProof.verifyUser(user1.address, "USA"))
        .to.be.revertedWith("Country not supported");
    });

    it("Should fail to verify same user twice for same country", async function () {
      await simpleAfricanProof.verifyUser(user1.address, "GHA");
      
      await expect(simpleAfricanProof.verifyUser(user1.address, "GHA"))
        .to.be.revertedWith("User already verified for this country");
    });

    it("Should allow verification for different countries", async function () {
      await simpleAfricanProof.verifyUser(user1.address, "GHA");
      await simpleAfricanProof.verifyUser(user1.address, "NGA");
      
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user1.address, "NGA")).to.equal(true);
    });

    it("Should only allow owner to verify users", async function () {
      await expect(simpleAfricanProof.connect(user1).verifyUser(user2.address, "GHA"))
        .to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Country Management", function () {
    it("Should allow owner to add new country", async function () {
      await simpleAfricanProof.addSupportedCountry("EGY"); // Egypt
      expect(await simpleAfricanProof.isCountrySupported("EGY")).to.equal(true);
    });

    it("Should allow owner to remove country", async function () {
      await simpleAfricanProof.removeSupportedCountry("GHA");
      expect(await simpleAfricanProof.isCountrySupported("GHA")).to.equal(false);
    });

    it("Should only allow owner to manage countries", async function () {
      await expect(simpleAfricanProof.connect(user1).addSupportedCountry("EGY"))
        .to.be.revertedWith("Only owner can call this function");
        
      await expect(simpleAfricanProof.connect(user1).removeSupportedCountry("GHA"))
        .to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Multiple Users", function () {
    it("Should verify multiple users for different countries", async function () {
      await simpleAfricanProof.verifyUser(user1.address, "GHA");
      await simpleAfricanProof.verifyUser(user2.address, "NGA");
      await simpleAfricanProof.verifyUser(user3.address, "KEN");
      
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user2.address, "NGA")).to.equal(true);
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user3.address, "KEN")).to.equal(true);
      
      // Check cross-verification (should be false)
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user1.address, "NGA")).to.equal(false);
      expect(await simpleAfricanProof.isUserVerifiedForCountry(user2.address, "KEN")).to.equal(false);
    });

    it("Should assign ENS domains to all verified users", async function () {
      await simpleAfricanProof.verifyUser(user1.address, "GHA");
      await simpleAfricanProof.verifyUser(user2.address, "NGA");
      
      expect(await simpleAfricanProof.getUserENSDomain(user1.address)).to.equal("gwill.eth");
      expect(await simpleAfricanProof.getUserENSDomain(user2.address)).to.equal("gwill.eth");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty country string", async function () {
      await expect(simpleAfricanProof.verifyUser(user1.address, ""))
        .to.be.revertedWith("Country not supported");
    });

    it("Should handle zero address", async function () {
      await expect(simpleAfricanProof.verifyUser(ethers.ZeroAddress, "GHA"))
        .to.not.be.reverted; // This should work, but might not be practical
    });

    it("Should return empty string for unverified user ENS domain", async function () {
      expect(await simpleAfricanProof.getUserENSDomain(user1.address)).to.equal("");
    });

    it("Should return zero timestamp for unverified user", async function () {
      expect(await simpleAfricanProof.getVerificationTimestamp(user1.address)).to.equal(0);
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
