const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AfricanProofWithENS", function () {
  let africanProofWithENS;
  let owner, verificationHub, user1, user2;

  beforeEach(async function () {
    [owner, verificationHub, user1, user2] = await ethers.getSigners();
    
    const AfricanProof = await ethers.getContractFactory("AfricanProof");
    africanProofWithENS = await AfricanProof.deploy(
      verificationHub.address,
      1, // scope
      ethers.keccak256(ethers.toUtf8Bytes("test-config"))
    );
    await africanProofWithENS.waitForDeployment();
  });

  describe("Basic Functionality", function () {
    it("Should deploy successfully", async function () {
      expect(await africanProofWithENS.getHub()).to.equal(verificationHub.address);
      expect(await africanProofWithENS.getScope()).to.equal(1);
    });

    it("Should handle verification success", async function () {
      // Create simple mock verification output with proper struct encoding
      const encodedOutput = ethers.AbiCoder.defaultAbiCoder().encode([
        "tuple(bytes32,uint256,uint256,uint256[4],string,string[3],string,string,string,string,string,uint256,bool[3])"
      ], [[
        ethers.keccak256(ethers.toUtf8Bytes("test")), // attestationId
        BigInt(user1.address), // userIdentifier
        12345, // nullifier
        [0, 0, 0, 0], // forbiddenCountriesListPacked
        "GHA", // issuingState
        ["John", "Doe", ""], // name
        "ID123456", // idNumber
        "GHA", // nationality
        "1990-01-01", // dateOfBirth
        "M", // gender
        "2030-01-01", // expiryDate
        18, // olderThan
        [false, false, false] // ofac
      ]]);

      const userData = "test-user-data";

      // This should work when called by the hub
      await africanProofWithENS.connect(verificationHub).onVerificationSuccess(
        encodedOutput,
        ethers.toUtf8Bytes(userData)
      );

      expect(await africanProofWithENS.verificationSuccessful()).to.equal(true);
      expect(await africanProofWithENS.lastUserData()).to.equal(userData);
      expect(await africanProofWithENS.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
    });

    it("Should prevent unauthorized verification calls", async function () {
      const mockOutput = ethers.AbiCoder.defaultAbiCoder().encode([
        "tuple(bytes32,uint256,uint256,uint256[4],string,string[3],string,string,string,string,string,uint256,bool[3])"
      ], [[
        ethers.keccak256(ethers.toUtf8Bytes("test")), // attestationId
        BigInt(user1.address), // userIdentifier
        12345, // nullifier
        [0, 0, 0, 0], // forbiddenCountriesListPacked
        "GHA", // issuingState
        ["John", "Doe", ""], // name
        "ID123456", // idNumber
        "GHA", // nationality
        "1990-01-01", // dateOfBirth
        "M", // gender
        "2030-01-01", // expiryDate
        18, // olderThan
        [false, false, false] // ofac
      ]]);

      await expect(africanProofWithENS.connect(user1).onVerificationSuccess(
        mockOutput,
        ethers.toUtf8Bytes("test")
      )).to.be.revertedWith("Only hub can call this function");
    });

    it("Should reset test state", async function () {
      await africanProofWithENS.resetTestState();
      expect(await africanProofWithENS.verificationSuccessful()).to.equal(false);
      expect(await africanProofWithENS.lastUserData()).to.equal("");
    });

    it("Should set scope", async function () {
      await africanProofWithENS.setScope(42);
      expect(await africanProofWithENS.getScope()).to.equal(42);
    });

    it("Should set verification config", async function () {
      const config = {
        minimumAge: 18,
        requireNationality: true,
        allowedCountries: ["GHA", "NGA"],
        requireIdNumber: true,
        requireName: true
      };

      await africanProofWithENS.setVerificationConfigNoHub(config);
      // Config should be set (we can't easily test the mapping, but no revert means success)
    });
  });

  describe("ENS Integration Features", function () {
    it("Should have correct chain ID and coin type", async function () {
      const chainId = await africanProofWithENS.chainId();
      const coinType = await africanProofWithENS.coinType();
      
      // Chain ID should be set during construction
      expect(chainId).to.be.greaterThan(0);
      
      // Coin type should be calculated according to ENSIP-11
      const expectedCoinType = (0x80000000 | Number(chainId)) >>> 0;
      expect(coinType).to.equal(expectedCoinType);
    });

    it("Should handle registry setting", async function () {
      const mockRegistryAddress = "0x1234567890123456789012345678901234567890";
      
      await africanProofWithENS._setRegistry("GHA", mockRegistryAddress);
      // Should not revert, indicating successful registry setting
    });

    it("Should reject invalid registry settings", async function () {
      await expect(africanProofWithENS._setRegistry("GHA", ethers.ZeroAddress))
        .to.be.revertedWith("Invalid registry address");
      
      await expect(africanProofWithENS._setRegistry("", "0x1234567890123456789012345678901234567890"))
        .to.be.revertedWith("Country cannot be empty");
    });
  });
});
