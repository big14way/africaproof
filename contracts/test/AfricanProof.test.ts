import { expect } from "chai";
import { ethers } from "hardhat";
import { AfricanProof, EnhancedAfricanProof, BaseAfricanEcosystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe.skip("AfricanProof System", function () {
  let africanProof: AfricanProof;
  let enhancedAfricanProof: EnhancedAfricanProof;
  let baseEcosystem: BaseAfricanEcosystem;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let mockHub: SignerWithAddress;
  let mockRegistry: SignerWithAddress;

  const GHANA_CODE = "GHA";
  const NIGERIA_CODE = "NGA";
  const KENYA_CODE = "KEN";
  const SOUTH_AFRICA_CODE = "ZAF";

  beforeEach(async function () {
    [owner, user1, user2, mockHub, mockRegistry] = await ethers.getSigners();

    // Deploy mock verification config
    const verificationConfigId = ethers.keccak256(ethers.toUtf8Bytes("test-config"));

    // Deploy AfricanProof contract
    const AfricanProofFactory = await ethers.getContractFactory("AfricanProof");
    africanProof = await AfricanProofFactory.deploy(
      mockHub.address,
      1, // scope
      verificationConfigId
    );

    // Deploy EnhancedAfricanProofSimplified contract
    const EnhancedAfricanProofFactory = await ethers.getContractFactory("EnhancedAfricanProofSimplified");
    enhancedAfricanProof = await EnhancedAfricanProofFactory.deploy(
      mockHub.address
    );

    // BaseAfricanEcosystem contract deployment commented out for now
    // const BaseEcosystemFactory = await ethers.getContractFactory("BaseAfricanEcosystem");
    // baseEcosystem = await BaseEcosystemFactory.deploy(africanProof.target);
  });

  describe("Basic AfricanProof Functionality", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await africanProof.verificationSuccessful()).to.equal(false);
      expect(await africanProof.chainId()).to.be.greaterThan(0);
    });

    it("Should verify user for Ghana", async function () {
      // Simulate verification success from Self.xyz hub
      const mockOutput = {
        userIdentifier: BigInt(user1.address),
        nationality: GHANA_CODE,
        minimumAge: 25,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier"))
      };

      const userData = ethers.toUtf8Bytes("test-user-data");

      // Call from mock hub
      await africanProof.connect(mockHub).onVerificationSuccess(mockOutput, userData);

      expect(await africanProof.verificationSuccessful()).to.equal(true);
      expect(await africanProof.isUserVerifiedForCountry(user1.address, GHANA_CODE)).to.equal(true);
      expect(await africanProof.lastUserAddress()).to.equal(user1.address);
    });

    it("Should not verify user for wrong country", async function () {
      const mockOutput = {
        userIdentifier: BigInt(user1.address),
        nationality: GHANA_CODE,
        minimumAge: 25,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier"))
      };

      const userData = ethers.toUtf8Bytes("test-user-data");
      await africanProof.connect(mockHub).onVerificationSuccess(mockOutput, userData);

      expect(await africanProof.isUserVerifiedForCountry(user1.address, NIGERIA_CODE)).to.equal(false);
    });
  });

  describe("Enhanced AfricanProof Features", function () {
    beforeEach(async function () {
      // Verify user1 for Ghana
      const mockOutput = {
        userIdentifier: BigInt(user1.address),
        nationality: GHANA_CODE,
        minimumAge: 25,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier-1"))
      };
      const userData = ethers.toUtf8Bytes("test-user-data-1");
      await enhancedAfricanProof.connect(mockHub).onVerificationSuccess(mockOutput, userData);

      // Verify user2 for Nigeria
      const mockOutput2 = {
        userIdentifier: BigInt(user2.address),
        nationality: NIGERIA_CODE,
        minimumAge: 30,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier-2"))
      };
      const userData2 = ethers.toUtf8Bytes("test-user-data-2");
      await enhancedAfricanProof.connect(mockHub).onVerificationSuccess(mockOutput2, userData2);
    });

    it("Should create ENS domain for verified user", async function () {
      const domain = await enhancedAfricanProof.getUserENSDomain(user1.address);
      expect(domain).to.not.equal("");
      expect(domain).to.include("gha"); // Should include country code
    });

    it("Should set initial text records", async function () {
      const domain = await enhancedAfricanProof.getUserENSDomain(user1.address);
      const node = ethers.keccak256(ethers.toUtf8Bytes(domain));
      
      const verificationStatus = await enhancedAfricanProof.getTextRecord(node, "verification.status");
      expect(verificationStatus).to.equal("verified");

      const country = await enhancedAfricanProof.getTextRecord(node, "verification.country");
      expect(country).to.equal(GHANA_CODE);
    });

    it("Should add verifiable credentials", async function () {
      await enhancedAfricanProof.connect(user1).addVerifiableCredential("education", "QmTestHash123");
      
      const credentials = await enhancedAfricanProof.getUserCredentials(user1.address);
      expect(credentials.length).to.equal(2); // Initial government_identity + education
      expect(credentials[1].credentialType).to.equal("education");
      expect(credentials[1].credentialHash).to.equal("QmTestHash123");
    });

    it("Should add community attestations", async function () {
      await enhancedAfricanProof.connect(user2).addCommunityAttestation(
        user1.address,
        "reputation",
        "excellent_community_member"
      );

      const attestations = await enhancedAfricanProof.getUserAttestations(user1.address);
      expect(attestations.length).to.equal(1);
      expect(attestations[0].attester).to.equal(user2.address);
      expect(attestations[0].attestationType).to.equal("reputation");
    });

    it("Should set custom text records", async function () {
      await enhancedAfricanProof.connect(user1).setTextRecord("custom.field", "custom_value");
      
      const domain = await enhancedAfricanProof.getUserENSDomain(user1.address);
      const node = ethers.keccak256(ethers.toUtf8Bytes(domain));
      
      const customValue = await enhancedAfricanProof.getTextRecord(node, "custom.field");
      expect(customValue).to.equal("custom_value");
    });

    it("Should verify cross-border operations", async function () {
      const canOperate = await enhancedAfricanProof.verifyCrossBorder(user1.address, NIGERIA_CODE);
      expect(canOperate).to.equal(false); // User1 is only verified for Ghana

      const canOperateInGhana = await enhancedAfricanProof.verifyCrossBorder(user1.address, GHANA_CODE);
      expect(canOperateInGhana).to.equal(true);
    });
  });

  describe("Base African Ecosystem", function () {
    beforeEach(async function () {
      // Verify users first
      const mockOutput1 = {
        userIdentifier: BigInt(user1.address),
        nationality: GHANA_CODE,
        minimumAge: 25,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier-1"))
      };
      await africanProof.connect(mockHub).onVerificationSuccess(mockOutput1, ethers.toUtf8Bytes("data1"));

      const mockOutput2 = {
        userIdentifier: BigInt(user2.address),
        nationality: NIGERIA_CODE,
        minimumAge: 30,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier-2"))
      };
      await africanProof.connect(mockHub).onVerificationSuccess(mockOutput2, ethers.toUtf8Bytes("data2"));
    });

    it("Should send micro-payments", async function () {
      const amount = ethers.parseEther("0.001"); // 0.001 ETH
      const initialBalance = await ethers.provider.getBalance(user2.address);

      await expect(
        baseEcosystem.connect(user1).sendMicroPayment(
          user2.address,
          amount,
          "test_payment",
          { value: amount }
        )
      ).to.emit(baseEcosystem, "MicroPayment");

      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should send cross-border remittances", async function () {
      const amount = ethers.parseEther("0.1");
      const initialBalance = await ethers.provider.getBalance(user2.address);

      await expect(
        baseEcosystem.connect(user1).sendRemittance(
          user2.address,
          GHANA_CODE,
          NIGERIA_CODE,
          { value: amount }
        )
      ).to.emit(baseEcosystem, "RemittanceSent");

      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);

      // Check remittance statistics
      const [totalVolume, transactionCount, averageFee] = await baseEcosystem.getRemittanceStats(GHANA_CODE, NIGERIA_CODE);
      expect(totalVolume).to.equal(amount);
      expect(transactionCount).to.equal(1);
    });

    it("Should contribute to community pools", async function () {
      const contribution = ethers.parseEther("0.05");
      
      await expect(
        baseEcosystem.connect(user1).contributeToPool("Ghana Farmers Cooperative", { value: contribution })
      ).to.emit(baseEcosystem, "CommunityPoolContribution");

      const [totalContributions, availableAmount, contributorCount, isActive] = 
        await baseEcosystem.getPoolDetails("Ghana Farmers Cooperative");
      
      expect(totalContributions).to.equal(contribution);
      expect(availableAmount).to.equal(contribution);
      expect(contributorCount).to.equal(1);
      expect(isActive).to.equal(true);
    });

    it("Should request and approve micro-loans", async function () {
      // First contribute to pool
      const contribution = ethers.parseEther("1");
      await baseEcosystem.connect(user2).contributeToPool("Ghana Farmers Cooperative", { value: contribution });

      // Request loan
      const loanAmount = ethers.parseEther("0.1");
      await expect(
        baseEcosystem.connect(user1).requestMicroLoan(
          loanAmount,
          "farming_equipment",
          "Ghana Farmers Cooperative"
        )
      ).to.emit(baseEcosystem, "MicroLoanRequested");

      // Check loan was created
      const userLoans = await baseEcosystem.getUserLoans(user1.address);
      expect(userLoans.length).to.equal(1);

      const loanDetails = await baseEcosystem.getLoanDetails(userLoans[0]);
      expect(loanDetails.borrower).to.equal(user1.address);
      expect(loanDetails.amount).to.equal(loanAmount);
      expect(loanDetails.purpose).to.equal("farming_equipment");
    });

    it("Should repay micro-loans", async function () {
      // Setup: contribute to pool and get loan
      const contribution = ethers.parseEther("1");
      await baseEcosystem.connect(user2).contributeToPool("Ghana Farmers Cooperative", { value: contribution });

      const loanAmount = ethers.parseEther("0.1");
      await baseEcosystem.connect(user1).requestMicroLoan(
        loanAmount,
        "farming_equipment",
        "Ghana Farmers Cooperative"
      );

      const userLoans = await baseEcosystem.getUserLoans(user1.address);
      const loanId = userLoans[0];

      // Approve loan
      await baseEcosystem.approveMicroLoan(loanId, "Ghana Farmers Cooperative");

      // Repay loan with interest
      const interest = (loanAmount * 500n) / 10000n; // 5% interest
      const totalRepayment = loanAmount + interest;

      await baseEcosystem.connect(user1).repayLoan(loanId, "Ghana Farmers Cooperative", { value: totalRepayment });

      const loanDetails = await baseEcosystem.getLoanDetails(loanId);
      expect(loanDetails.isRepaid).to.equal(true);
    });

    it("Should reject operations from unverified users", async function () {
      const [unverifiedUser] = await ethers.getSigners();
      const amount = ethers.parseEther("0.001");

      await expect(
        baseEcosystem.connect(unverifiedUser).sendMicroPayment(
          user1.address,
          amount,
          "test",
          { value: amount }
        )
      ).to.be.revertedWith("User not verified for any African country");
    });

    it("Should handle minimum payment requirements", async function () {
      const tooSmallAmount = ethers.parseEther("0.0000001"); // Below MIN_PAYMENT

      await expect(
        baseEcosystem.connect(user1).sendMicroPayment(
          user2.address,
          tooSmallAmount,
          "test",
          { value: tooSmallAmount }
        )
      ).to.be.revertedWith("Amount too small");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete user journey", async function () {
      // 1. User verification
      const mockOutput = {
        userIdentifier: BigInt(user1.address),
        nationality: GHANA_CODE,
        minimumAge: 25,
        nullifier: ethers.keccak256(ethers.toUtf8Bytes("test-nullifier"))
      };
      await enhancedAfricanProof.connect(mockHub).onVerificationSuccess(mockOutput, ethers.toUtf8Bytes("data"));

      // 2. Check ENS domain creation
      const domain = await enhancedAfricanProof.getUserENSDomain(user1.address);
      expect(domain).to.not.equal("");

      // 3. Add credentials
      await enhancedAfricanProof.connect(user1).addVerifiableCredential("income", "QmIncomeProof");

      // 4. Use in ecosystem
      const amount = ethers.parseEther("0.01");
      await baseEcosystem.connect(user1).contributeToPool("Ghana Farmers Cooperative", { value: amount });

      // 5. Verify all components work together
      const credentials = await enhancedAfricanProof.getUserCredentials(user1.address);
      expect(credentials.length).to.equal(2); // government_identity + income

      const [totalContributions] = await baseEcosystem.getPoolDetails("Ghana Farmers Cooperative");
      expect(totalContributions).to.equal(amount);
    });
  });
});
