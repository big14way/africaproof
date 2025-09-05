// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {StringUtils} from "@ensdomains/ens-contracts/contracts/utils/StringUtils.sol";
import {IL2Registry} from "./interfaces/IL2Registry.sol";

/**
 * @title EnhancedAfricanProof
 * @notice Enhanced implementation with advanced ENS features for African identity verification
 * @dev Includes text records for verifiable credentials, community attestations, and cross-border coordination
 */
contract EnhancedAfricanProof is SelfVerificationRoot {
    using StringUtils for string;

    // Events for enhanced functionality
    event TextRecordSet(bytes32 indexed node, string indexed key, string value);
    event CommunityAttestation(address indexed attester, address indexed user, string attestationType, string data);
    event CrossBorderVerification(address indexed user, string fromCountry, string toCountry);
    event VerifiableCredentialAdded(address indexed user, string credentialType, string credentialHash);

    // Structs for enhanced data
    struct VerifiableCredential {
        string credentialType; // "education", "employment", "income", "identity"
        string credentialHash; // IPFS hash or encrypted data
        uint256 timestamp;
        bool isActive;
    }

    struct CommunityAttestationData {
        address attester;
        string attestationType; // "reputation", "skill", "community_standing"
        string data;
        uint256 timestamp;
        bool isValid;
    }

    // Enhanced mappings
    mapping(address => mapping(string => bool)) public userCountryVerification;
    mapping(address => string) public userToENSDomain;
    mapping(bytes32 => mapping(string => string)) public textRecords; // ENS node => key => value
    mapping(address => VerifiableCredential[]) public userCredentials;
    mapping(address => CommunityAttestationData[]) public userAttestations;
    mapping(address => mapping(string => uint256)) public crossBorderVerifications; // user => country => timestamp

    // Configuration
    IL2Registry public l2Registry;
    uint256 public chainId;
    uint256 public immutable coinType;
    
    // Enhanced verification state
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    string public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId,
        address _l2Registry
    ) SelfVerificationRoot(identityVerificationHubV2Address, scope) {
        verificationConfigId = _verificationConfigId;
        l2Registry = IL2Registry(_l2Registry);
        
        assembly {
            sstore(chainId.slot, chainid())
        }
        coinType = (0x80000000 | chainId) >> 0;
    }

    /**
     * @notice Enhanced verification hook with ENS text records and credentials
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = string(userData);
        lastUserAddress = address(uint160(output.userIdentifier));
        string memory country = output.nationality;

        // Mark user as verified for their country
        userCountryVerification[lastUserAddress][country] = true;

        // Create ENS domain with enhanced features
        _createEnhancedENSDomain(lastUserAddress, country, output);
        
        // Set initial text records for identity verification
        _setInitialTextRecords(lastUserAddress, output);
        
        // Add initial verifiable credential
        _addVerifiableCredential(
            lastUserAddress,
            "government_identity",
            _generateCredentialHash(output)
        );

        emit CrossBorderVerification(lastUserAddress, country, country);
    }

    /**
     * @notice Create ENS domain with enhanced metadata
     */
    function _createEnhancedENSDomain(
        address user,
        string memory country,
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output
    ) internal {
        // Generate domain name based on user data
        string memory domainName = _generateDomainName(user, country);
        userToENSDomain[user] = domainName;

        // Register domain through L2Registry
        l2Registry.createSubnode(
            l2Registry.baseNode(),
            domainName,
            user,
            new bytes[](0)
        );

        // Set address resolution
        bytes32 node = _labelToNode(domainName);
        bytes memory addr = abi.encodePacked(user);
        l2Registry.setAddr(node, coinType, addr);
        l2Registry.setAddr(node, 60, addr); // ETH mainnet compatibility
    }

    /**
     * @notice Set initial text records for verified identity
     */
    function _setInitialTextRecords(
        address user,
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output
    ) internal {
        string memory domainName = userToENSDomain[user];
        bytes32 node = _labelToNode(domainName);

        // Set verification status
        _setTextRecord(node, "verification.status", "verified");
        _setTextRecord(node, "verification.timestamp", _toString(block.timestamp));
        _setTextRecord(node, "verification.country", output.nationality);
        _setTextRecord(node, "verification.provider", "AfricanProof");
        
        // Set identity metadata (privacy-preserving)
        _setTextRecord(node, "identity.verified", "true");
        _setTextRecord(node, "identity.age_verified", output.minimumAge >= 18 ? "true" : "false");
    }

    /**
     * @notice Add verifiable credential to user's profile
     */
    function addVerifiableCredential(
        string memory credentialType,
        string memory credentialHash
    ) external {
        _addVerifiableCredential(msg.sender, credentialType, credentialHash);
    }

    function _addVerifiableCredential(
        address user,
        string memory credentialType,
        string memory credentialHash
    ) internal {
        userCredentials[user].push(VerifiableCredential({
            credentialType: credentialType,
            credentialHash: credentialHash,
            timestamp: block.timestamp,
            isActive: true
        }));

        // Update ENS text record
        string memory domainName = userToENSDomain[user];
        if (bytes(domainName).length > 0) {
            bytes32 node = _labelToNode(domainName);
            string memory key = string(abi.encodePacked("credential.", credentialType));
            _setTextRecord(node, key, credentialHash);
        }

        emit VerifiableCredentialAdded(user, credentialType, credentialHash);
    }

    /**
     * @notice Add community attestation
     */
    function addCommunityAttestation(
        address user,
        string memory attestationType,
        string memory data
    ) external {
        require(isUserVerified(msg.sender), "Attester must be verified");
        require(isUserVerified(user), "User must be verified");

        userAttestations[user].push(CommunityAttestationData({
            attester: msg.sender,
            attestationType: attestationType,
            data: data,
            timestamp: block.timestamp,
            isValid: true
        }));

        // Update ENS text record
        string memory domainName = userToENSDomain[user];
        if (bytes(domainName).length > 0) {
            bytes32 node = _labelToNode(domainName);
            string memory key = string(abi.encodePacked("attestation.", attestationType));
            _setTextRecord(node, key, data);
        }

        emit CommunityAttestation(msg.sender, user, attestationType, data);
    }

    /**
     * @notice Set custom text record for ENS domain
     */
    function setTextRecord(string memory key, string memory value) external {
        string memory domainName = userToENSDomain[msg.sender];
        require(bytes(domainName).length > 0, "No ENS domain found");
        
        bytes32 node = _labelToNode(domainName);
        _setTextRecord(node, key, value);
    }

    function _setTextRecord(bytes32 node, string memory key, string memory value) internal {
        textRecords[node][key] = value;
        emit TextRecordSet(node, key, value);
    }

    /**
     * @notice Get text record from ENS domain
     */
    function getTextRecord(bytes32 node, string memory key) external view returns (string memory) {
        return textRecords[node][key];
    }

    /**
     * @notice Verify user for cross-border operations
     */
    function verifyCrossBorder(address user, string memory targetCountry) external view returns (bool) {
        // User must be verified in at least one country
        if (!isUserVerified(user)) return false;
        
        // Check if user has cross-border verification for target country
        return crossBorderVerifications[user][targetCountry] > 0 || 
               _hasCountryVerification(user, targetCountry);
    }

    /**
     * @notice Check if user is verified for specific country
     */
    function isUserVerifiedForCountry(address user, string memory country) external view returns (bool) {
        return userCountryVerification[user][country];
    }

    /**
     * @notice Check if user is verified in any country
     */
    function isUserVerified(address user) public view returns (bool) {
        return bytes(userToENSDomain[user]).length > 0;
    }

    /**
     * @notice Get user's ENS domain
     */
    function getUserENSDomain(address user) external view returns (string memory) {
        return userToENSDomain[user];
    }

    /**
     * @notice Get user's verifiable credentials
     */
    function getUserCredentials(address user) external view returns (VerifiableCredential[] memory) {
        return userCredentials[user];
    }

    /**
     * @notice Get user's community attestations
     */
    function getUserAttestations(address user) external view returns (CommunityAttestationData[] memory) {
        return userAttestations[user];
    }

    // Helper functions
    function _hasCountryVerification(address user, string memory country) internal view returns (bool) {
        return userCountryVerification[user][country];
    }

    function _generateDomainName(address user, string memory country) internal pure returns (string memory) {
        return string(abi.encodePacked(_addressToString(user), ".", _toLowerCase(country)));
    }

    function _generateCredentialHash(ISelfVerificationRoot.GenericDiscloseOutputV2 memory output) internal pure returns (string memory) {
        return _toString(uint256(keccak256(abi.encodePacked(output.userIdentifier, output.nationality))));
    }

    function _labelToNode(string memory label) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(label));
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        return _toString(uint256(uint160(addr)));
    }

    function _toLowerCase(string memory str) internal pure returns (string memory) {
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

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
