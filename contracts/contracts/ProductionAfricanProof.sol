// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProductionAfricanProof
 * @notice Production-ready African identity verification system for ETH Accra hackathon
 * @dev Implements ENS integration, Base network optimization, and African financial inclusion features
 */
contract ProductionAfricanProof is Ownable, ReentrancyGuard, Pausable {
    
    // ============ EVENTS ============
    
    event UserVerified(
        address indexed user, 
        string indexed country, 
        string ensName, 
        uint256 timestamp
    );
    
    event ENSTextRecordSet(
        address indexed user, 
        string indexed key, 
        string value
    );
    
    event CommunityAttestation(
        address indexed attester, 
        address indexed user, 
        string attestationType, 
        string data
    );
    
    event CrossBorderVerification(
        address indexed user, 
        string fromCountry, 
        string toCountry
    );
    
    event MicroPayment(
        address indexed from, 
        address indexed to, 
        uint256 amount, 
        string purpose
    );
    
    event RemittanceSent(
        address indexed sender, 
        address indexed recipient, 
        uint256 amount, 
        string fromCountry, 
        string toCountry
    );

    // ============ STRUCTS ============
    
    struct UserProfile {
        bool isVerified;
        string country;
        string ensName;
        uint256 verificationTimestamp;
        mapping(string => string) textRecords; // ENS text records
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
    
    struct RemittanceChannel {
        string fromCountry;
        string toCountry;
        uint256 totalVolume;
        uint256 transactionCount;
        uint256 averageFee; // in basis points
    }

    // ============ STATE VARIABLES ============
    
    // Core verification mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(address => mapping(string => bool)) public userCountryVerification;
    mapping(string => bool) public supportedCountries;
    
    // ENS and credentials
    mapping(address => VerifiableCredential[]) public userCredentials;
    mapping(address => CommunityAttestationData[]) public userAttestations;
    
    // Base network optimizations
    mapping(string => RemittanceChannel) public remittanceChannels;
    mapping(address => uint256) public userBalances;
    
    // Configuration
    uint256 public constant MIN_PAYMENT = 1e12; // 0.000001 ETH (sub-cent on Base)
    uint256 public constant PLATFORM_FEE_BP = 25; // 0.25% platform fee
    string public constant BASE_ENS_NAME = "godswillgwill.base.eth";
    
    // Verification hub (for Self.xyz integration)
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
        
        // Initialize popular remittance channels
        _initializeRemittanceChannel("GHA", "NGA");
        _initializeRemittanceChannel("KEN", "ZAF");
        _initializeRemittanceChannel("NGA", "GHA");
        _initializeRemittanceChannel("EGY", "MAR");
    }

    // ============ CORE VERIFICATION FUNCTIONS ============
    
    /**
     * @notice Verify a user for a specific African country
     * @param user The user address to verify
     * @param country The country code (GHA, NGA, KEN, ZAF, etc.)
     * @param additionalData Additional verification data
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
        
        // Set initial ENS text records
        _setTextRecord(user, "verification.status", "verified");
        _setTextRecord(user, "verification.timestamp", _toString(block.timestamp));
        _setTextRecord(user, "verification.country", country);
        _setTextRecord(user, "verification.provider", "AfricanProof");
        _setTextRecord(user, "identity.verified", "true");
        
        // Add initial government identity credential
        _addVerifiableCredential(user, "government_identity", additionalData);
        
        emit UserVerified(user, country, BASE_ENS_NAME, block.timestamp);
    }
    
    /**
     * @notice Check if user is verified for specific country
     */
    function isUserVerifiedForCountry(address user, string memory country) external view returns (bool) {
        return userCountryVerification[user][country];
    }
    
    /**
     * @notice Get user's ENS name
     */
    function getUserENSName(address user) external view returns (string memory) {
        return userProfiles[user].ensName;
    }

    // ============ ENS TEXT RECORDS FUNCTIONS ============
    
    /**
     * @notice Set ENS text record for user
     */
    function setTextRecord(string memory key, string memory value) external onlyVerified {
        _setTextRecord(msg.sender, key, value);
    }
    
    /**
     * @notice Get ENS text record for user
     */
    function getTextRecord(address user, string memory key) external view returns (string memory) {
        return userProfiles[user].textRecords[key];
    }
    
    function _setTextRecord(address user, string memory key, string memory value) internal {
        userProfiles[user].textRecords[key] = value;
        emit ENSTextRecordSet(user, key, value);
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
        
        // Update ENS text record
        string memory key = string(abi.encodePacked("credential.", credentialType));
        _setTextRecord(user, key, credentialHash);
    }
    
    /**
     * @notice Get user's credentials count
     */
    function getUserCredentialsCount(address user) external view returns (uint256) {
        return userCredentials[user].length;
    }
    
    /**
     * @notice Get specific credential
     */
    function getUserCredential(address user, uint256 index) external view returns (
        string memory credentialType,
        string memory credentialHash,
        uint256 timestamp,
        bool isActive
    ) {
        require(index < userCredentials[user].length, "Credential index out of bounds");
        VerifiableCredential memory cred = userCredentials[user][index];
        return (cred.credentialType, cred.credentialHash, cred.timestamp, cred.isActive);
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
        
        // Update ENS text record
        string memory key = string(abi.encodePacked("attestation.", attestationType));
        _setTextRecord(user, key, data);
        
        emit CommunityAttestation(msg.sender, user, attestationType, data);
    }
    
    /**
     * @notice Get user's attestations count
     */
    function getUserAttestationsCount(address user) external view returns (uint256) {
        return userAttestations[user].length;
    }

    // ============ BASE NETWORK FEATURES ============
    
    /**
     * @notice Send micro-payment (Base optimized)
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
        string memory channelKey = string(abi.encodePacked(fromCountry, "-", toCountry));
        
        RemittanceChannel storage channel = remittanceChannels[channelKey];
        
        // Dynamic fee based on volume
        uint256 baseFee = 100; // 1%
        uint256 volumeDiscount = channel.totalVolume > 100 ether ? 25 : 0;
        uint256 feeRate = baseFee - volumeDiscount;
        
        uint256 fee = (msg.value * feeRate) / 10000;
        uint256 netAmount = msg.value - fee;
        
        // Update channel statistics
        channel.totalVolume += msg.value;
        channel.transactionCount++;
        channel.averageFee = ((channel.averageFee * (channel.transactionCount - 1)) + feeRate) / channel.transactionCount;
        
        (bool success, ) = recipient.call{value: netAmount}("");
        require(success, "Remittance failed");
        
        emit RemittanceSent(msg.sender, recipient, netAmount, fromCountry, toCountry);
        emit CrossBorderVerification(msg.sender, fromCountry, toCountry);
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Add supported country
     */
    function addSupportedCountry(string memory country) external onlyOwner {
        supportedCountries[country] = true;
    }
    
    /**
     * @notice Add authorized verifier
     */
    function addAuthorizedVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }
    
    /**
     * @notice Remove authorized verifier
     */
    function removeAuthorizedVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }
    
    /**
     * @notice Update verification hub
     */
    function updateVerificationHub(address newHub) external onlyOwner {
        verificationHub = newHub;
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ HELPER FUNCTIONS ============
    
    function _initializeRemittanceChannel(string memory fromCountry, string memory toCountry) internal {
        string memory channelKey = string(abi.encodePacked(fromCountry, "-", toCountry));
        remittanceChannels[channelKey] = RemittanceChannel({
            fromCountry: fromCountry,
            toCountry: toCountry,
            totalVolume: 0,
            transactionCount: 0,
            averageFee: 100 // 1% initial fee
        });
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
    
    /**
     * @notice Get remittance channel stats
     */
    function getRemittanceStats(string memory fromCountry, string memory toCountry) external view returns (
        uint256 totalVolume,
        uint256 transactionCount,
        uint256 averageFee
    ) {
        string memory channelKey = string(abi.encodePacked(fromCountry, "-", toCountry));
        RemittanceChannel memory channel = remittanceChannels[channelKey];
        return (channel.totalVolume, channel.transactionCount, channel.averageFee);
    }
    
    /**
     * @notice Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    receive() external payable {}
}
