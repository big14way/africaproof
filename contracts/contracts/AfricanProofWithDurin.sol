// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProductionAfricanProof.sol";

/// @notice Interface for Durin L2 Registry
interface IL2Registry {
        function baseNode() external view returns (bytes32);
        function createSubnode(
            bytes32 node,
            string calldata label,
            address owner,
            bytes[] calldata data
        ) external returns (bytes32);
        function makeNode(
            bytes32 parentNode,
            string calldata label
        ) external pure returns (bytes32);
        function setAddr(bytes32 node, uint256 coinType, bytes calldata addr) external;
        function setText(bytes32 node, string calldata key, string calldata value) external;
        function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title AfricanProofWithDurin
/// @notice Enhanced AfricanProof with Durin L2 ENS subdomain integration
/// @dev Extends ProductionAfricanProof with hierarchical ENS identity system
contract AfricanProofWithDurin is ProductionAfricanProof {

    /// @notice Events for subdomain operations
    event SubdomainMinted(address indexed user, string subdomain, string country);
    event SubdomainUpdated(address indexed user, string subdomain, string key, string value);
    event CountryRegistryAdded(string country, address registry);

    /// @notice Mapping from country code to L2 Registry address
    mapping(string => address) public countryRegistries;
    
    /// @notice Mapping from user address to their subdomain
    mapping(address => string) public userSubdomains;
    
    /// @notice Mapping from country to subdomain count (for unique naming)
    mapping(string => uint256) public countrySubdomainCount;

    /// @notice Chain ID for current network
    uint256 public chainId;

    /// @notice Coin type for current chain (ENSIP-11)
    uint256 public immutable coinType;

    /// @notice Constructor
    /// @param _verificationHub Address of the verification hub
    constructor(address _verificationHub) ProductionAfricanProof(_verificationHub) {
        // Save the chainId
        chainId = block.chainid;

        // Calculate the coinType for the current chain according to ENSIP-11
        coinType = (0x80000000 | chainId) >> 0;
    }

    /// @notice Add a country registry (only owner)
    /// @param country Country code (e.g., "GHA", "NGA")
    /// @param registry Address of the L2 Registry for this country
    function addCountryRegistry(string memory country, address registry) external onlyOwner {
        require(registry != address(0), "Invalid registry address");
        require(bytes(country).length > 0, "Invalid country code");
        
        countryRegistries[country] = registry;
        emit CountryRegistryAdded(country, registry);
    }

    /// @notice Mint a subdomain for a verified user
    /// @param user Address of the verified user
    /// @param subdomain Desired subdomain name (e.g., "kwame")
    /// @param country Country code the user is verified for
    function mintUserSubdomain(
        address user,
        string memory subdomain,
        string memory country
    ) external {
        require(userProfiles[user].isVerified &&
                keccak256(bytes(userProfiles[user].country)) == keccak256(bytes(country)),
                "User not verified for country");
        require(countryRegistries[country] != address(0), "Country registry not set");
        require(bytes(userSubdomains[user]).length == 0, "User already has subdomain");
        require(bytes(subdomain).length >= 3, "Subdomain too short");
        
        IL2Registry registry = IL2Registry(countryRegistries[country]);
        
        // Create the subdomain label
        string memory fullSubdomain = string(abi.encodePacked(
            subdomain, ".", toLower(country), ".gwill.eth"
        ));
        
        // Convert address to bytes for ENSIP-11
        bytes memory addr = abi.encodePacked(user);
        
        // Create the subnode in the registry
        bytes32 baseNode = registry.baseNode();
        bytes32 node = registry.makeNode(baseNode, subdomain);
        
        // Set address records for both current chain and ETH mainnet
        registry.setAddr(node, coinType, addr);
        registry.setAddr(node, 60, addr); // ETH mainnet coinType
        
        // Set initial text records
        registry.setText(node, "verification.status", "verified");
        registry.setText(node, "verification.country", country);
        registry.setText(node, "verification.provider", "AfricanProof");
        registry.setText(node, "profile.platform", "AfricanProof");
        
        // Create the subnode
        registry.createSubnode(baseNode, subdomain, user, new bytes[](0));
        
        // Store user's subdomain
        userSubdomains[user] = fullSubdomain;
        countrySubdomainCount[country]++;
        
        emit SubdomainMinted(user, fullSubdomain, country);
    }

    /// @notice Update text records for user's subdomain
    /// @param key Text record key
    /// @param value Text record value
    function updateSubdomainTextRecord(string memory key, string memory value) external {
        require(bytes(userSubdomains[msg.sender]).length > 0, "User has no subdomain");
        
        require(userProfiles[msg.sender].isVerified, "User not verified");

        string memory country = userProfiles[msg.sender].country;
        require(countryRegistries[country] != address(0), "Country registry not set");
        
        IL2Registry registry = IL2Registry(countryRegistries[country]);
        
        // Extract subdomain from full domain
        string memory subdomain = _extractSubdomain(userSubdomains[msg.sender]);
        bytes32 baseNode = registry.baseNode();
        bytes32 node = registry.makeNode(baseNode, subdomain);
        
        // Update text record
        registry.setText(node, key, value);
        
        emit SubdomainUpdated(msg.sender, userSubdomains[msg.sender], key, value);
    }

    /// @notice Check if a subdomain is available for a country
    /// @param subdomain Subdomain to check
    /// @param country Country code
    /// @return available True if available, false if taken
    function isSubdomainAvailable(string memory subdomain, string memory country) 
        external view returns (bool available) {
        if (countryRegistries[country] == address(0)) {
            return false;
        }
        
        if (bytes(subdomain).length < 3) {
            return false;
        }
        
        IL2Registry registry = IL2Registry(countryRegistries[country]);
        bytes32 baseNode = registry.baseNode();
        bytes32 node = registry.makeNode(baseNode, subdomain);
        uint256 tokenId = uint256(node);
        
        try registry.ownerOf(tokenId) {
            return false; // Already owned
        } catch {
            return true; // Available
        }
    }

    /// @notice Get user's full subdomain
    /// @param user User address
    /// @return subdomain Full subdomain string
    function getUserSubdomain(address user) external view returns (string memory) {
        return userSubdomains[user];
    }

    /// @notice Get country registry address
    /// @param country Country code
    /// @return registry Registry address
    function getCountryRegistry(string memory country) external view returns (address) {
        return countryRegistries[country];
    }

    /// @notice Get subdomain count for a country
    /// @param country Country code
    /// @return count Number of subdomains minted for this country
    function getCountrySubdomainCount(string memory country) external view returns (uint256) {
        return countrySubdomainCount[country];
    }

    /// @notice Extract subdomain from full domain string
    /// @param fullDomain Full domain (e.g., "kwame.ghana.gwill.eth")
    /// @return subdomain Just the subdomain part (e.g., "kwame")
    function _extractSubdomain(string memory fullDomain) internal pure returns (string memory) {
        bytes memory domainBytes = bytes(fullDomain);
        uint256 firstDot = 0;
        
        // Find first dot
        for (uint256 i = 0; i < domainBytes.length; i++) {
            if (domainBytes[i] == '.') {
                firstDot = i;
                break;
            }
        }
        
        // Extract substring before first dot
        bytes memory subdomainBytes = new bytes(firstDot);
        for (uint256 i = 0; i < firstDot; i++) {
            subdomainBytes[i] = domainBytes[i];
        }
        
        return string(subdomainBytes);
    }

    /// @notice Convert string to lowercase
    /// @param str Input string
    /// @return Lowercase string
    function toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        
        return string(bLower);
    }
}
