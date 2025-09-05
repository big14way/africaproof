import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

  // Configuration for Base networks
  const isMainnet = network.chainId === 8453n;
  const isTestnet = network.chainId === 84532n;

  if (!isMainnet && !isTestnet) {
    throw new Error("This script is only for Base Mainnet (8453) or Base Sepolia (84532)");
  }

  // Configuration
  const scope = "africanproof";
  const verificationConfigId = ethers.keccak256(ethers.toUtf8Bytes("africanproof-config"));
  
  // Base network Self.xyz hub addresses (these would need to be updated with actual addresses)
  const hubAddress = isMainnet 
    ? "0x68c931C9a534D37aa78094877F46fE46a49F1A51" // Placeholder - update with actual Base mainnet hub
    : "0x68c931C9a534D37aa78094877F46fE46a49F1A51"; // Placeholder - update with actual Base testnet hub

  // L2 Registry address for Base (would need actual ENS L2 registry on Base)
  const l2RegistryAddress = isMainnet
    ? "0xe42cfac25e82e3b77fefc740a934e11f03957c17" // Placeholder
    : "0xe42cfac25e82e3b77fefc740a934e11f03957c17"; // Placeholder

  console.log("\n=== Deployment Configuration ===");
  console.log("Hub Address:", hubAddress);
  console.log("L2 Registry:", l2RegistryAddress);
  console.log("Scope:", scope);
  console.log("Verification Config ID:", verificationConfigId);

  // Deploy L2Registrar first
  console.log("\n=== Deploying L2Registrar ===");
  const L2Registrar = await ethers.getContractFactory("L2Registrar");
  const l2Registrar = await L2Registrar.deploy(l2RegistryAddress);
  await l2Registrar.waitForDeployment();
  const l2RegistrarAddress = await l2Registrar.getAddress();
  console.log("L2Registrar deployed to:", l2RegistrarAddress);

  // Deploy ProductionAfricanProof contract (main contract)
  console.log("\n=== Deploying ProductionAfricanProof ===");
  const ProductionAfricanProof = await ethers.getContractFactory("ProductionAfricanProof");
  const africanProof = await ProductionAfricanProof.deploy(hubAddress);
  await africanProof.waitForDeployment();
  const africanProofAddress = await africanProof.getAddress();
  console.log("ProductionAfricanProof deployed to:", africanProofAddress);

  // Deploy SimpleAfricanProof contract (for testing)
  console.log("\n=== Deploying SimpleAfricanProof ===");
  const SimpleAfricanProof = await ethers.getContractFactory("SimpleAfricanProof");
  const simpleAfricanProof = await SimpleAfricanProof.deploy();
  await simpleAfricanProof.waitForDeployment();
  const simpleAfricanProofAddress = await simpleAfricanProof.getAddress();
  console.log("SimpleAfricanProof deployed to:", simpleAfricanProofAddress);

  // Deploy Enhanced AfricanProof contract
  console.log("\n=== Deploying EnhancedAfricanProof ===");
  const EnhancedAfricanProof = await ethers.getContractFactory("EnhancedAfricanProof");
  const enhancedAfricanProof = await EnhancedAfricanProof.deploy(
    hubAddress,
    1, // scope
    verificationConfigId,
    l2RegistryAddress
  );
  await enhancedAfricanProof.waitForDeployment();
  const enhancedAfricanProofAddress = await enhancedAfricanProof.getAddress();
  console.log("EnhancedAfricanProof deployed to:", enhancedAfricanProofAddress);

  // Deploy Base African Ecosystem
  console.log("\n=== Deploying BaseAfricanEcosystem ===");
  const BaseAfricanEcosystem = await ethers.getContractFactory("BaseAfricanEcosystem");
  const baseEcosystem = await BaseAfricanEcosystem.deploy(africanProofAddress);
  await baseEcosystem.waitForDeployment();
  const baseEcosystemAddress = await baseEcosystem.getAddress();
  console.log("BaseAfricanEcosystem deployed to:", baseEcosystemAddress);

  // Deploy example contracts
  console.log("\n=== Deploying Example Contracts ===");
  
  // Deploy Disaster Relief
  const DisasterRelief = await ethers.getContractFactory("DisasterRelief");
  // For demo purposes, we'll use a mock ERC20 token address
  const mockTokenAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
  const disasterRelief = await DisasterRelief.deploy(africanProofAddress, mockTokenAddress);
  await disasterRelief.waitForDeployment();
  const disasterReliefAddress = await disasterRelief.getAddress();
  console.log("DisasterRelief deployed to:", disasterReliefAddress);

  // Deploy African Governance
  const AfricanGovernance = await ethers.getContractFactory("AfricanGovernance");
  const africanGovernance = await AfricanGovernance.deploy(africanProofAddress);
  await africanGovernance.waitForDeployment();
  const africanGovernanceAddress = await africanGovernance.getAddress();
  console.log("AfricanGovernance deployed to:", africanGovernanceAddress);

  // Deploy Gated Contract Example
  const MyGatedContract = await ethers.getContractFactory("MyGatedContract");
  const gatedContract = await MyGatedContract.deploy(africanProofAddress);
  await gatedContract.waitForDeployment();
  const gatedContractAddress = await gatedContract.getAddress();
  console.log("MyGatedContract deployed to:", gatedContractAddress);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      L2Registrar: l2RegistrarAddress,
      AfricanProof: africanProofAddress,
      EnhancedAfricanProof: enhancedAfricanProofAddress,
      BaseAfricanEcosystem: baseEcosystemAddress,
      DisasterRelief: disasterReliefAddress,
      AfricanGovernance: africanGovernanceAddress,
      MyGatedContract: gatedContractAddress
    },
    configuration: {
      hubAddress,
      l2RegistryAddress,
      scope,
      verificationConfigId,
      mockTokenAddress
    }
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = isMainnet ? "base" : "baseSepolia";
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Also update latest.json for backward compatibility
  const latestFile = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestFile, JSON.stringify({
    network: networkName,
    contractAddress: africanProofAddress,
    enhancedContractAddress: enhancedAfricanProofAddress,
    ecosystemAddress: baseEcosystemAddress,
    hubAddress,
    deployedAt: deploymentInfo.deployedAt,
    deployer: deployer.address
  }, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("All contracts deployed successfully!");
  console.log("Deployment info saved to:", deploymentFile);
  console.log("\n=== Contract Addresses ===");
  Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on Base explorer");
  console.log("2. Update frontend configuration with new addresses");
  console.log("3. Test the complete user flow");
  console.log("4. Set up monitoring and alerts");

  if (isTestnet) {
    console.log("\n=== Testnet Instructions ===");
    console.log("1. Get Base Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    console.log("2. Test all functionality before mainnet deployment");
    console.log("3. Verify ENS integration works correctly");
  }

  // Verify contracts if on mainnet
  if (isMainnet) {
    console.log("\n=== Verification Commands ===");
    console.log("Run these commands to verify contracts:");
    console.log(`npx hardhat verify --network base ${africanProofAddress} "${hubAddress}" 1 "${verificationConfigId}"`);
    console.log(`npx hardhat verify --network base ${enhancedAfricanProofAddress} "${hubAddress}" 1 "${verificationConfigId}" "${l2RegistryAddress}"`);
    console.log(`npx hardhat verify --network base ${baseEcosystemAddress} "${africanProofAddress}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
