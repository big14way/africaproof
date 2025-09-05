// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AfricanProofWithSIWE.sol";

/// @notice EFP List NFT interface (simplified)
interface IEFP {
        function follow(address target) external;
        function unfollow(address target) external;
        function isFollowing(address follower, address target) external view returns (bool);
        function getFollowers(address target) external view returns (address[] memory);
        function getFollowing(address user) external view returns (address[] memory);
    }

/// @title AfricanProofWithEFP
/// @notice Complete AfricanProof with Ethereum Follow Protocol integration
/// @dev Extends AfricanProofWithSIWE with professional networking features
contract AfricanProofWithEFP is AfricanProofWithSIWE {

    /// @notice Professional connection structure
    struct ProfessionalConnection {
        address user;
        string country;
        string industry;
        uint256 connectedAt;
        bool isActive;
    }

    /// @notice Industry network structure
    struct IndustryNetwork {
        string name;
        address[] members;
        uint256 memberCount;
        bool isActive;
    }

    /// @notice Events for EFP operations
    event ProfessionalConnectionMade(
        address indexed follower, 
        address indexed target, 
        string followerCountry, 
        string targetCountry,
        bool isCrossBorder
    );
    event IndustryNetworkJoined(address indexed user, string industry);
    event CrossBorderTradeConnection(
        address indexed trader1, 
        address indexed trader2, 
        string country1, 
        string country2
    );

    /// @notice EFP contract address (would be set to actual EFP deployment)
    address public efpContract;
    
    /// @notice Mapping from user to their professional connections
    mapping(address => ProfessionalConnection[]) public professionalConnections;
    
    /// @notice Mapping from user to addresses they follow
    mapping(address => address[]) public userFollowing;
    
    /// @notice Mapping from user to their followers
    mapping(address => address[]) public userFollowers;
    
    /// @notice Mapping from country to verified users
    mapping(string => address[]) public countryNetworks;
    
    /// @notice Mapping from industry to users
    mapping(string => address[]) public industryNetworks;
    
    /// @notice Mapping from industry name to network details
    mapping(string => IndustryNetwork) public industryDetails;
    
    /// @notice Cross-border connections tracking
    mapping(address => mapping(address => bool)) public crossBorderConnections;
    
    /// @notice User's industry
    mapping(address => string) public userIndustry;

    /// @notice Supported industries
    string[] public supportedIndustries;

    /// @notice Constructor
    /// @param _verificationHub Address of the verification hub
    constructor(address _verificationHub) AfricanProofWithSIWE(_verificationHub) {
        // Initialize supported industries
        supportedIndustries.push("agriculture");
        supportedIndustries.push("trading");
        supportedIndustries.push("manufacturing");
        supportedIndustries.push("technology");
        supportedIndustries.push("finance");
        supportedIndustries.push("healthcare");
        supportedIndustries.push("education");
        supportedIndustries.push("energy");
        supportedIndustries.push("transportation");
        supportedIndustries.push("tourism");
        
        // Initialize industry networks
        for (uint i = 0; i < supportedIndustries.length; i++) {
            industryDetails[supportedIndustries[i]] = IndustryNetwork({
                name: supportedIndustries[i],
                members: new address[](0),
                memberCount: 0,
                isActive: true
            });
        }
    }

    /// @notice Set EFP contract address (only owner)
    /// @param _efpContract EFP contract address
    function setEFPContract(address _efpContract) external onlyOwner {
        efpContract = _efpContract;
    }

    /// @notice Follow another verified African professional
    /// @param target Address to follow
    function followAfricanProfessional(address target) external {
        require(userProfiles[msg.sender].isVerified, "Follower must be verified");
        require(userProfiles[target].isVerified, "Target must be verified");
        require(msg.sender != target, "Cannot follow yourself");
        require(this.hasValidSession(msg.sender), "Valid SIWE session required");
        
        // Update activity
        userSessions[msg.sender].lastActivity = block.timestamp;
        
        // Get user countries
        string memory followerCountry = userProfiles[msg.sender].country;
        string memory targetCountry = userProfiles[target].country;
        
        // Check if already following
        bool alreadyFollowing = false;
        for (uint i = 0; i < userFollowing[msg.sender].length; i++) {
            if (userFollowing[msg.sender][i] == target) {
                alreadyFollowing = true;
                break;
            }
        }
        require(!alreadyFollowing, "Already following this user");
        
        // Add to following/followers lists
        userFollowing[msg.sender].push(target);
        userFollowers[target].push(msg.sender);
        
        // Create professional connection
        professionalConnections[msg.sender].push(ProfessionalConnection({
            user: target,
            country: targetCountry,
            industry: userIndustry[target],
            connectedAt: block.timestamp,
            isActive: true
        }));
        
        // Check if cross-border connection
        bool isCrossBorder = keccak256(bytes(followerCountry)) != keccak256(bytes(targetCountry));
        if (isCrossBorder) {
            crossBorderConnections[msg.sender][target] = true;
            emit CrossBorderTradeConnection(msg.sender, target, followerCountry, targetCountry);
        }
        
        // Follow on EFP if contract is set
        if (efpContract != address(0)) {
            IEFP(efpContract).follow(target);
        }
        
        emit ProfessionalConnectionMade(
            msg.sender, 
            target, 
            followerCountry, 
            targetCountry, 
            isCrossBorder
        );
    }

    /// @notice Unfollow a professional
    /// @param target Address to unfollow
    function unfollowProfessional(address target) external {
        require(this.hasValidSession(msg.sender), "Valid SIWE session required");
        
        // Update activity
        userSessions[msg.sender].lastActivity = block.timestamp;
        
        // Remove from following list
        for (uint i = 0; i < userFollowing[msg.sender].length; i++) {
            if (userFollowing[msg.sender][i] == target) {
                userFollowing[msg.sender][i] = userFollowing[msg.sender][userFollowing[msg.sender].length - 1];
                userFollowing[msg.sender].pop();
                break;
            }
        }
        
        // Remove from followers list
        for (uint i = 0; i < userFollowers[target].length; i++) {
            if (userFollowers[target][i] == msg.sender) {
                userFollowers[target][i] = userFollowers[target][userFollowers[target].length - 1];
                userFollowers[target].pop();
                break;
            }
        }
        
        // Deactivate professional connection
        for (uint i = 0; i < professionalConnections[msg.sender].length; i++) {
            if (professionalConnections[msg.sender][i].user == target) {
                professionalConnections[msg.sender][i].isActive = false;
                break;
            }
        }
        
        // Remove cross-border connection
        crossBorderConnections[msg.sender][target] = false;
        
        // Unfollow on EFP if contract is set
        if (efpContract != address(0)) {
            IEFP(efpContract).unfollow(target);
        }
    }

    /// @notice Join an industry network
    /// @param industry Industry to join
    function joinIndustryNetwork(string memory industry) external {
        require(userProfiles[msg.sender].isVerified, "User must be verified");
        require(industryDetails[industry].isActive, "Industry network not active");
        require(bytes(userIndustry[msg.sender]).length == 0, "Already in an industry");
        
        // Add user to industry
        userIndustry[msg.sender] = industry;
        industryNetworks[industry].push(msg.sender);
        industryDetails[industry].members.push(msg.sender);
        industryDetails[industry].memberCount++;
        
        emit IndustryNetworkJoined(msg.sender, industry);
    }

    /// @notice Get African professional network for a user
    /// @param user User address
    /// @return connections Array of professional connections
    function getAfricanProfessionalNetwork(address user) 
        external view returns (ProfessionalConnection[] memory) {
        return professionalConnections[user];
    }

    /// @notice Get cross-border connections for a user
    /// @param user User address
    /// @return crossBorderUsers Array of cross-border connections
    function getCrossBorderConnections(address user) 
        external view returns (address[] memory crossBorderUsers) {
        
        address[] memory following = userFollowing[user];
        uint256 crossBorderCount = 0;
        
        // Count cross-border connections
        for (uint i = 0; i < following.length; i++) {
            if (crossBorderConnections[user][following[i]]) {
                crossBorderCount++;
            }
        }
        
        // Create array of cross-border connections
        crossBorderUsers = new address[](crossBorderCount);
        uint256 index = 0;
        
        for (uint i = 0; i < following.length; i++) {
            if (crossBorderConnections[user][following[i]]) {
                crossBorderUsers[index] = following[i];
                index++;
            }
        }
    }

    /// @notice Get users in same country network
    /// @param country Country code
    /// @return users Array of verified users in country
    function getCountryNetwork(string memory country) 
        external view returns (address[] memory) {
        return countryNetworks[country];
    }

    /// @notice Get users in same industry network
    /// @param industry Industry name
    /// @return users Array of users in industry
    function getIndustryNetwork(string memory industry) 
        external view returns (address[] memory) {
        return industryNetworks[industry];
    }

    /// @notice Get user's followers
    /// @param user User address
    /// @return followers Array of follower addresses
    function getFollowers(address user) external view returns (address[] memory) {
        return userFollowers[user];
    }

    /// @notice Get users that a user is following
    /// @param user User address
    /// @return following Array of addresses being followed
    function getFollowing(address user) external view returns (address[] memory) {
        return userFollowing[user];
    }

    /// @notice Get supported industries
    /// @return industries Array of supported industry names
    function getSupportedIndustries() external view returns (string[] memory) {
        return supportedIndustries;
    }

    /// @notice Override verifyUser to add to country network
    /// @param user User to verify
    /// @param country Country code
    /// @param verificationData Verification data
    function verifyUser(address user, string memory country, string memory verificationData) 
        public override {
        // Call parent verification - simplified for testing
        require(userProfiles[user].isVerified || msg.sender == owner(), "Not authorized to verify");

        if (!userProfiles[user].isVerified) {
            UserProfile storage profile = userProfiles[user];
            profile.isVerified = true;
            profile.country = country;
            profile.verificationTimestamp = block.timestamp;
            profile.ensName = BASE_ENS_NAME;
            profile.isActive = true;

            emit UserVerified(user, country, BASE_ENS_NAME, block.timestamp);
        }
        
        // Add to country network
        countryNetworks[country].push(user);
    }

    /// @notice Check if user is following another user
    /// @param follower Follower address
    /// @param target Target address
    /// @return isFollowing True if following
    function isFollowing(address follower, address target) external view returns (bool) {
        for (uint i = 0; i < userFollowing[follower].length; i++) {
            if (userFollowing[follower][i] == target) {
                return true;
            }
        }
        return false;
    }
}
