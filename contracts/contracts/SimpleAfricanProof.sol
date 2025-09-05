// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title SimpleAfricanProof
 * @notice Simplified version for testing and demonstration
 * @dev Basic implementation without complex dependencies for initial testing
 */
contract SimpleAfricanProof {
    // Events
    event UserVerified(address indexed user, string country, uint256 timestamp);
    event ENSDomainCreated(address indexed user, string domain, string country);
    
    // State variables
    mapping(address => mapping(string => bool)) public userCountryVerification;
    mapping(address => string) public userENSDomain;
    mapping(address => uint256) public verificationTimestamp;
    
    // African countries supported
    mapping(string => bool) public supportedCountries;
    
    // Admin
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
        // Initialize supported African countries
        supportedCountries["GHA"] = true; // Ghana
        supportedCountries["NGA"] = true; // Nigeria
        supportedCountries["KEN"] = true; // Kenya
        supportedCountries["ZAF"] = true; // South Africa
    }
    
    /**
     * @notice Verify a user for a specific African country
     * @param user The user address to verify
     * @param country The country code (GHA, NGA, KEN, ZAF)
     */
    function verifyUser(address user, string memory country) external onlyOwner {
        require(supportedCountries[country], "Country not supported");
        require(!userCountryVerification[user][country], "User already verified for this country");
        
        userCountryVerification[user][country] = true;
        verificationTimestamp[user] = block.timestamp;
        
        // Create ENS domain name
        string memory domain = string(abi.encodePacked("gwill.eth"));
        userENSDomain[user] = domain;
        
        emit UserVerified(user, country, block.timestamp);
        emit ENSDomainCreated(user, domain, country);
    }
    
    /**
     * @notice Check if user is verified for specific country
     * @param user The user address
     * @param country The country code
     * @return bool True if verified
     */
    function isUserVerifiedForCountry(address user, string memory country) external view returns (bool) {
        return userCountryVerification[user][country];
    }
    
    /**
     * @notice Get user's ENS domain
     * @param user The user address
     * @return string The ENS domain
     */
    function getUserENSDomain(address user) external view returns (string memory) {
        return userENSDomain[user];
    }
    
    /**
     * @notice Get verification timestamp
     * @param user The user address
     * @return uint256 The timestamp
     */
    function getVerificationTimestamp(address user) external view returns (uint256) {
        return verificationTimestamp[user];
    }
    
    /**
     * @notice Add support for new country
     * @param country The country code to add
     */
    function addSupportedCountry(string memory country) external onlyOwner {
        supportedCountries[country] = true;
    }
    
    /**
     * @notice Remove support for country
     * @param country The country code to remove
     */
    function removeSupportedCountry(string memory country) external onlyOwner {
        supportedCountries[country] = false;
    }
    
    /**
     * @notice Check if country is supported
     * @param country The country code
     * @return bool True if supported
     */
    function isCountrySupported(string memory country) external view returns (bool) {
        return supportedCountries[country];
    }
}
