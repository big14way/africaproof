// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EnhancedAfricanProofSimplified
 * @notice Enhanced African identity verification with advanced ENS features (simplified version)
 * @dev Includes text records for verifiable credentials, community attestations, and cross-border coordination
 */
contract EnhancedAfricanProofSimplified is Ownable, ReentrancyGuard, Pausable {
    
    // ============ EVENTS ============
    
    event UserVerified(address indexed user, string indexed country, string ensName, uint256 timestamp);
    event TextRecordSet(address indexed user, string indexed key, string value);
    event CommunityAttestation(address indexed attester, address indexed user, string attestationType, string data);
    event CrossBorderVerification(address indexed user, string fromCountry, string toCountry);
    event VerifiableCredentialAdded(address indexed user, string credentialType, string credentialHash);
    event MicroPayment(address indexed from, address indexed to, uint256 amount, string purpose);
    event RemittanceSent(address indexed sender, address indexed recipient, uint256 amount, string fromCountry, string toCountry);

    // ============ STRUCTS ============
    
    struct UserProfile {
        bool isVerified;
        string country;
        string ensName;
        uint256 verificationTimestamp;
        mapping(string => string) textRecords; // ENS-like text records
        bool isActive;
    }
    
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
    
    struct CrossBorderData {
        string fromCountry;
        string toCountry;
        uint256 timestamp;
        bool isActive;
    }

    // ============ STATE VARIABLES ============
    
    // Core verification mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(address => mapping(string => bool)) public userCountryVerification;
    mapping(string => bool) public supportedCountries;
    
    // Enhanced features
    mapping(address => VerifiableCredential[]) public userCredentials;
    mapping(address => CommunityAttestationData[]) public userAttestations;
    mapping(address => CrossBorderData[]) public crossBorderVerifications;
    mapping(address => uint256) public userBalances;
    
    // Configuration
    uint256 public constant MIN_PAYMENT = 1e12; // 0.000001 ETH
    uint256 public constant PLATFORM_FEE_BP = 25; // 0.25%
    string public constant BASE_ENS_NAME = "gwill.eth";
    
    // Verification hub
    address public verificationHub;
    mapping(address => bool) public authorizedVerifiers;

    // ============ MODIFIERS ============
    
    modifier onlyVerified() {
        require(userProfiles[msg.sender].isVerified, "User not verified");
        _;
    }
    
    modifier onlyAuthorizedVerifier() {
        require(
            authorizedVerifiers[msg.sender] || msg.sender == owner() || msg.sender == verificationHub,
            "Not authorized to verify users"
        );
        _;
    }
    
    modifier validCountry(string memory country) {
        require(supportedCountries[country], "Country not supported");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _verificationHub) Ownable(msg.sender) {
        verificationHub = _verificationHub;
        
        // Initialize supported African countries
        supportedCountries["GHA"] = true; // Ghana
        supportedCountries["NGA"] = true; // Nigeria
        supportedCountries["KEN"] = true; // Kenya
        supportedCountries["ZAF"] = true; // South Africa
        supportedCountries["EGY"] = true; // Egypt
        supportedCountries["MAR"] = true; // Morocco
        supportedCountries["TUN"] = true; // Tunisia
        supportedCountries["ETH"] = true; // Ethiopia
    }

    // ============ CORE VERIFICATION FUNCTIONS ============
    
    /**
     * @notice Verify a user for a specific African country
     */
    function verifyUser(
        address user, 
        string memory country,
        string memory additionalData
    ) external onlyAuthorizedVerifier validCountry(country) whenNotPaused {
        require(!userProfiles[user].isVerified, "User already verified");
        
        // Create user profile
        UserProfile storage profile = userProfiles[user];
        profile.isVerified = true;
        profile.country = country;
        profile.ensName = BASE_ENS_NAME;
        profile.verificationTimestamp = block.timestamp;
        profile.isActive = true;
        
        // Set country verification
        userCountryVerification[user][country] = true;
        
        // Set initial text records
        _setTextRecord(user, "verification.status", "verified");
        _setTextRecord(user, "verification.timestamp", _toString(block.timestamp));
        _setTextRecord(user, "verification.country", country);
        _setTextRecord(user, "verification.provider", "EnhancedAfricanProof");
        _setTextRecord(user, "identity.verified", "true");
        
        // Add initial government identity credential
        _addVerifiableCredential(user, "government_identity", additionalData);
        
        emit UserVerified(user, country, BASE_ENS_NAME, block.timestamp);
    }

    // ============ ENS TEXT RECORDS FUNCTIONS ============
    
    /**
     * @notice Set text record for user (ENS-like functionality)
     */
    function setTextRecord(string memory key, string memory value) external onlyVerified {
        _setTextRecord(msg.sender, key, value);
    }
    
    /**
     * @notice Get text record for user
     */
    function getTextRecord(address user, string memory key) external view returns (string memory) {
        return userProfiles[user].textRecords[key];
    }
    
    function _setTextRecord(address user, string memory key, string memory value) internal {
        userProfiles[user].textRecords[key] = value;
        emit TextRecordSet(user, key, value);
    }

    // ============ VERIFIABLE CREDENTIALS ============
    
    /**
     * @notice Add verifiable credential
     */
    function addVerifiableCredential(
        string memory credentialType,
        string memory credentialHash
    ) external onlyVerified {
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
        
        // Update text record
        string memory key = string(abi.encodePacked("credential.", credentialType));
        _setTextRecord(user, key, credentialHash);
        
        emit VerifiableCredentialAdded(user, credentialType, credentialHash);
    }

    // ============ COMMUNITY ATTESTATIONS ============
    
    /**
     * @notice Add community attestation
     */
    function addCommunityAttestation(
        address user,
        string memory attestationType,
        string memory data
    ) external onlyVerified {
        require(userProfiles[user].isVerified, "Target user not verified");
        
        userAttestations[user].push(CommunityAttestationData({
            attester: msg.sender,
            attestationType: attestationType,
            data: data,
            timestamp: block.timestamp,
            isValid: true
        }));
        
        // Update text record
        string memory key = string(abi.encodePacked("attestation.", attestationType));
        _setTextRecord(user, key, data);
        
        emit CommunityAttestation(msg.sender, user, attestationType, data);
    }

    // ============ CROSS-BORDER FEATURES ============
    
    /**
     * @notice Add cross-border verification
     */
    function addCrossBorderVerification(
        address user,
        string memory fromCountry,
        string memory toCountry
    ) external onlyAuthorizedVerifier {
        require(userProfiles[user].isVerified, "User not verified");
        require(supportedCountries[fromCountry] && supportedCountries[toCountry], "Invalid countries");
        
        crossBorderVerifications[user].push(CrossBorderData({
            fromCountry: fromCountry,
            toCountry: toCountry,
            timestamp: block.timestamp,
            isActive: true
        }));
        
        // Set country verification for destination
        userCountryVerification[user][toCountry] = true;
        
        emit CrossBorderVerification(user, fromCountry, toCountry);
    }

    // ============ PAYMENT FEATURES ============
    
    /**
     * @notice Send micro-payment
     */
    function sendMicroPayment(
        address recipient,
        string memory purpose
    ) external payable onlyVerified nonReentrant {
        require(msg.value >= MIN_PAYMENT, "Amount too small");
        require(userProfiles[recipient].isVerified, "Recipient not verified");
        
        uint256 fee = (msg.value * PLATFORM_FEE_BP) / 10000;
        uint256 netAmount = msg.value - fee;
        
        (bool success, ) = recipient.call{value: netAmount}("");
        require(success, "Payment failed");
        
        emit MicroPayment(msg.sender, recipient, netAmount, purpose);
    }
    
    /**
     * @notice Send cross-border remittance
     */
    function sendRemittance(
        address recipient,
        string memory toCountry
    ) external payable onlyVerified nonReentrant {
        require(msg.value >= MIN_PAYMENT, "Amount too small");
        require(userCountryVerification[recipient][toCountry], "Recipient not verified for target country");
        
        string memory fromCountry = userProfiles[msg.sender].country;
        
        uint256 fee = (msg.value * PLATFORM_FEE_BP) / 10000;
        uint256 netAmount = msg.value - fee;
        
        (bool success, ) = recipient.call{value: netAmount}("");
        require(success, "Remittance failed");
        
        emit RemittanceSent(msg.sender, recipient, netAmount, fromCountry, toCountry);
    }

    // ============ VIEW FUNCTIONS ============
    
    function isUserVerifiedForCountry(address user, string memory country) external view returns (bool) {
        return userCountryVerification[user][country];
    }
    
    function getUserENSName(address user) external view returns (string memory) {
        return userProfiles[user].ensName;
    }
    
    function getUserCredentialsCount(address user) external view returns (uint256) {
        return userCredentials[user].length;
    }
    
    function getUserAttestationsCount(address user) external view returns (uint256) {
        return userAttestations[user].length;
    }
    
    function getCrossBorderVerificationsCount(address user) external view returns (uint256) {
        return crossBorderVerifications[user].length;
    }

    // ============ ADMIN FUNCTIONS ============
    
    function addSupportedCountry(string memory country) external onlyOwner {
        supportedCountries[country] = true;
    }
    
    function addAuthorizedVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }
    
    function removeAuthorizedVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ HELPER FUNCTIONS ============
    
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
    
    receive() external payable {}
}
