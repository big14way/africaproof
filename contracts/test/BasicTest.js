const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AfricanProof Basic Tests", function () {
  let africanProof;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy a simple mock for testing
    const AfricanProof = await ethers.getContractFactory("AfricanProof");
    
    // Mock parameters for deployment
    const mockHub = owner.address;
    const scope = 1;
    const verificationConfigId = ethers.keccak256(ethers.toUtf8Bytes("test-config"));
    
    africanProof = await AfricanProof.deploy(mockHub, scope, verificationConfigId);
    await africanProof.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await africanProof.getAddress()).to.be.properAddress;
  });

  it("Should have correct initial state", async function () {
    expect(await africanProof.verificationSuccessful()).to.equal(false);
  });

  it("Should verify user for Ghana", async function () {
    // Create properly encoded mock verification output as struct
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
      25, // olderThan
      [false, false, false] // ofac
    ]]);

    const userData = ethers.toUtf8Bytes("test-user-data");

    // Call verification from owner (acting as hub)
    await africanProof.connect(owner).onVerificationSuccess(encodedOutput, userData);

    expect(await africanProof.verificationSuccessful()).to.equal(true);
    expect(await africanProof.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
  });

  it("Should not verify user for wrong country", async function () {
    // Create properly encoded mock verification output as struct
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
      25, // olderThan
      [false, false, false] // ofac
    ]]);

    const userData = ethers.toUtf8Bytes("test-user-data");
    await africanProof.connect(owner).onVerificationSuccess(encodedOutput, userData);

    // Should be verified for GHA but not for NGA
    expect(await africanProof.isUserVerifiedForCountry(user1.address, "GHA")).to.equal(true);
    expect(await africanProof.isUserVerifiedForCountry(user1.address, "NGA")).to.equal(false);
  });
});
