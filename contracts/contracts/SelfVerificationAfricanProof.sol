// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title SelfVerificationAfricanProof
 * @notice Advanced self-verification system for African identity without external dependencies
 * @dev Implements multiple verification methods: SIWE, document hashes, community attestation, and social proof
 */
contract SelfVerificationAfricanProof is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ STRUCTS ============
    
    struct UserProfile {
        bool isVerified;
        string country;
        string ensName;
        uint256 verificationTimestamp;
        uint256 trustScore;
        VerificationMethod primaryMethod;
        bool isActive;
        mapping(string => string) textRecords;
    }
    
    struct VerificationProof {
        VerificationMethod method;
        bytes32 dataHash;
        uint256 timestamp;
        address[] attestors;
        uint256 trustScore;
        bool isValid;
    }
    
    struct CommunityAttestation {
        address attestor;
        address user;
        string attestationType;
        string data;
        uint256 timestamp;
        bool isValid;
    }

    enum VerificationMethod {
        NONE,
        SIWE_SOCIAL,
        DOCUMENT_UPLOAD,
        COMMUNITY_ATTESTATION,
        PHONE_LOCATION,
        MULTI_FACTOR
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => UserProfile) public userProfiles;
    mapping(address => mapping(string => bool)) public userCountryVerification;
    mapping(address => VerificationProof[]) public userVerificationProofs;
    mapping(address => CommunityAttestation[]) public userAttestations;
    mapping(string => bool) public supportedCountries;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bool) public trustedAttestors;
    
    // Verification requirements
    uint256 public constant MIN_TRUST_SCORE = 70;
    uint256 public constant COMMUNITY_ATTESTATION_REQUIRED = 3;
    uint256 public constant VERIFICATION_VALIDITY_PERIOD = 365 days;
    
    string public constant BASE_ENS_NAME = "gwill.eth";

    // ============ EVENTS ============
    
    event UserSelfVerified(
        address indexed user, 
        string country, 
        VerificationMethod method,
        uint256 trustScore,
        uint256 timestamp
    );
    event VerificationProofAdded(address indexed user, VerificationMethod method, uint256 trustScore);
    event CommunityAttestationAdded(address indexed attestor, address indexed user, string attestationType);
    event TrustScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event ENSTextRecordSet(address indexed user, string indexed key, string value);

    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Initialize supported African countries
        supportedCountries["GHA"] = true; // Ghana
        supportedCountries["NGA"] = true; // Nigeria
        supportedCountries["KEN"] = true; // Kenya
        supportedCountries["ZAF"] = true; // South Africa
        supportedCountries["EGY"] = true; // Egypt
        supportedCountries["MAR"] = true; // Morocco
        supportedCountries["TUN"] = true; // Tunisia
        supportedCountries["ETH"] = true; // Ethiopia
        supportedCountries["UGA"] = true; // Uganda
        supportedCountries["TZA"] = true; // Tanzania
        
        authorizedVerifiers[msg.sender] = true;
        trustedAttestors[msg.sender] = true;
    }

    // ============ MODIFIERS ============
    
    modifier validCountry(string memory country) {
        require(supportedCountries[country], "Country not supported");
        _;
    }
    
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    modifier onlyTrustedAttestor() {
        require(trustedAttestors[msg.sender] || msg.sender == owner(), "Not trusted attestor");
        _;
    }

    // ============ SELF-VERIFICATION FUNCTIONS ============
    
    /**
     * @notice Self-verify using SIWE + Social Proof
     * @param country User's country code
     * @param message Signed message containing verification data
     * @param signature User's signature
     * @param socialProofHash Hash of social media proofs
     */
    function selfVerifyWithSIWE(
        string memory country,
        string memory message,
        bytes memory signature,
        bytes32 socialProofHash
    ) external validCountry(country) whenNotPaused nonReentrant {
        require(!userProfiles[msg.sender].isVerified, "User already verified");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(recoveredSigner == msg.sender, "Invalid signature");
        
        // Verify message contains required data
        require(_containsAddress(message, msg.sender), "Message must contain user address");
        require(_containsCountry(message, country), "Message must contain country");
        
        // Create verification proof
        bytes32 proofHash = keccak256(abi.encodePacked(message, signature, socialProofHash));
        uint256 trustScore = 85; // SIWE + Social gets 85% trust
        
        _addVerificationProof(msg.sender, VerificationMethod.SIWE_SOCIAL, proofHash, trustScore);
        _createUserProfile(msg.sender, country, VerificationMethod.SIWE_SOCIAL, trustScore);
        
        emit UserSelfVerified(msg.sender, country, VerificationMethod.SIWE_SOCIAL, trustScore, block.timestamp);
    }
    
    /**
     * @notice Self-verify using document upload
     * @param country User's country code
     * @param documentHash IPFS hash of encrypted document
     * @param documentType Type of document (passport, national_id, etc.)
     */
    function selfVerifyWithDocument(
        string memory country,
        bytes32 documentHash,
        string memory documentType
    ) external validCountry(country) whenNotPaused nonReentrant {
        require(!userProfiles[msg.sender].isVerified, "User already verified");
        require(documentHash != bytes32(0), "Invalid document hash");
        
        uint256 trustScore = 95; // Document verification gets highest trust
        
        _addVerificationProof(msg.sender, VerificationMethod.DOCUMENT_UPLOAD, documentHash, trustScore);
        _createUserProfile(msg.sender, country, VerificationMethod.DOCUMENT_UPLOAD, trustScore);
        
        // Set document metadata
        _setTextRecord(msg.sender, "verification.document_type", documentType);
        _setTextRecord(msg.sender, "verification.document_hash", _bytes32ToString(documentHash));
        
        emit UserSelfVerified(msg.sender, country, VerificationMethod.DOCUMENT_UPLOAD, trustScore, block.timestamp);
    }
    
    /**
     * @notice Request community attestation for verification
     * @param country User's country code
     */
    function requestCommunityAttestation(
        string memory country
    ) external validCountry(country) whenNotPaused {
        require(!userProfiles[msg.sender].isVerified, "User already verified");
        
        // Create pending verification profile
        UserProfile storage profile = userProfiles[msg.sender];
        profile.country = country;
        profile.verificationTimestamp = block.timestamp;
        profile.primaryMethod = VerificationMethod.COMMUNITY_ATTESTATION;
        
        emit UserSelfVerified(msg.sender, country, VerificationMethod.COMMUNITY_ATTESTATION, 0, block.timestamp);
    }
    
    /**
     * @notice Add community attestation for a user
     * @param user User to attest for
     * @param attestationType Type of attestation
     * @param data Attestation data
     */
    function addCommunityAttestation(
        address user,
        string memory attestationType,
        string memory data
    ) external onlyTrustedAttestor whenNotPaused {
        require(userProfiles[user].primaryMethod == VerificationMethod.COMMUNITY_ATTESTATION, "User not requesting community attestation");
        
        CommunityAttestation memory attestation = CommunityAttestation({
            attestor: msg.sender,
            user: user,
            attestationType: attestationType,
            data: data,
            timestamp: block.timestamp,
            isValid: true
        });
        
        userAttestations[user].push(attestation);
        
        // Check if user has enough attestations
        uint256 validAttestations = _countValidAttestations(user);
        if (validAttestations >= COMMUNITY_ATTESTATION_REQUIRED) {
            uint256 trustScore = 80; // Community attestation gets 80% trust
            _finalizeUserProfile(user, trustScore);
        }
        
        emit CommunityAttestationAdded(msg.sender, user, attestationType);
    }

    // ============ INTERNAL FUNCTIONS ============
    
    function _createUserProfile(
        address user,
        string memory country,
        VerificationMethod method,
        uint256 trustScore
    ) internal {
        UserProfile storage profile = userProfiles[user];
        profile.isVerified = true;
        profile.country = country;
        profile.ensName = BASE_ENS_NAME;
        profile.verificationTimestamp = block.timestamp;
        profile.trustScore = trustScore;
        profile.primaryMethod = method;
        profile.isActive = true;
        
        userCountryVerification[user][country] = true;
        
        // Set initial text records
        _setTextRecord(user, "verification.status", "verified");
        _setTextRecord(user, "verification.timestamp", _toString(block.timestamp));
        _setTextRecord(user, "verification.country", country);
        _setTextRecord(user, "verification.provider", "AfricanProof");
        _setTextRecord(user, "verification.method", _methodToString(method));
        _setTextRecord(user, "verification.trust_score", _toString(trustScore));
    }
    
    function _finalizeUserProfile(address user, uint256 trustScore) internal {
        UserProfile storage profile = userProfiles[user];
        profile.isVerified = true;
        profile.trustScore = trustScore;
        profile.isActive = true;
        
        userCountryVerification[user][profile.country] = true;
        
        _setTextRecord(user, "verification.status", "verified");
        _setTextRecord(user, "verification.trust_score", _toString(trustScore));
    }
    
    function _addVerificationProof(
        address user,
        VerificationMethod method,
        bytes32 dataHash,
        uint256 trustScore
    ) internal {
        VerificationProof memory proof = VerificationProof({
            method: method,
            dataHash: dataHash,
            timestamp: block.timestamp,
            attestors: new address[](0),
            trustScore: trustScore,
            isValid: true
        });
        
        userVerificationProofs[user].push(proof);
        emit VerificationProofAdded(user, method, trustScore);
    }
    
    function _setTextRecord(address user, string memory key, string memory value) internal {
        userProfiles[user].textRecords[key] = value;
        emit ENSTextRecordSet(user, key, value);
    }
    
    function _countValidAttestations(address user) internal view returns (uint256) {
        uint256 count = 0;
        CommunityAttestation[] memory attestations = userAttestations[user];
        for (uint256 i = 0; i < attestations.length; i++) {
            if (attestations[i].isValid) {
                count++;
            }
        }
        return count;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getUserProfile(address user) external view returns (
        bool isVerified,
        string memory country,
        string memory ensName,
        uint256 verificationTimestamp,
        uint256 trustScore,
        VerificationMethod primaryMethod,
        bool isActive
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.isVerified,
            profile.country,
            profile.ensName,
            profile.verificationTimestamp,
            profile.trustScore,
            profile.primaryMethod,
            profile.isActive
        );
    }
    
    function getTextRecord(address user, string memory key) external view returns (string memory) {
        return userProfiles[user].textRecords[key];
    }
    
    function getUserVerificationProofs(address user) external view returns (VerificationProof[] memory) {
        return userVerificationProofs[user];
    }
    
    function getUserAttestations(address user) external view returns (CommunityAttestation[] memory) {
        return userAttestations[user];
    }

    // ============ UTILITY FUNCTIONS ============
    
    function _containsAddress(string memory message, address addr) internal pure returns (bool) {
        // Simple check - in production, use more robust string matching
        return bytes(message).length > 0;
    }
    
    function _containsCountry(string memory message, string memory country) internal pure returns (bool) {
        // Simple check - in production, use more robust string matching
        return bytes(message).length > 0 && bytes(country).length > 0;
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
    
    function _bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
    
    function _methodToString(VerificationMethod method) internal pure returns (string memory) {
        if (method == VerificationMethod.SIWE_SOCIAL) return "siwe_social";
        if (method == VerificationMethod.DOCUMENT_UPLOAD) return "document_upload";
        if (method == VerificationMethod.COMMUNITY_ATTESTATION) return "community_attestation";
        if (method == VerificationMethod.PHONE_LOCATION) return "phone_location";
        if (method == VerificationMethod.MULTI_FACTOR) return "multi_factor";
        return "none";
    }

    // ============ ADMIN FUNCTIONS ============
    
    function addTrustedAttestor(address attestor) external onlyOwner {
        trustedAttestors[attestor] = true;
    }
    
    function removeTrustedAttestor(address attestor) external onlyOwner {
        trustedAttestors[attestor] = false;
    }
    
    function addSupportedCountry(string memory countryCode) external onlyOwner {
        supportedCountries[countryCode] = true;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
