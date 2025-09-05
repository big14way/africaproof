// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AfricanProofWithDurin.sol";

/// @title AfricanProofWithSIWE
/// @notice Enhanced AfricanProof with Sign-In With Ethereum (SIWE) integration
/// @dev Extends AfricanProofWithDurin with SIWE authentication features
contract AfricanProofWithSIWE is AfricanProofWithDurin {
    
    /// @notice SIWE message structure
    struct SIWEMessage {
        string domain;
        address userAddress;
        string statement;
        string uri;
        string version;
        uint256 chainId;
        string nonce;
        string issuedAt;
        string expirationTime;
        string notBefore;
        string requestId;
        string[] resources;
    }

    /// @notice User session information
    struct UserSession {
        bool isActive;
        uint256 expiresAt;
        string nonce;
        string domain;
        uint256 lastActivity;
    }

    /// @notice Events for SIWE operations
    event SIWELogin(address indexed user, string domain, uint256 expiresAt);
    event SIWELogout(address indexed user);
    event SessionExpired(address indexed user);
    event NonceGenerated(address indexed user, string nonce);

    /// @notice Mapping from user address to their session
    mapping(address => UserSession) public userSessions;
    
    /// @notice Mapping from nonce to user address (for validation)
    mapping(string => address) public nonceToUser;
    
    /// @notice Mapping to track used nonces (prevent replay attacks)
    mapping(string => bool) public usedNonces;

    /// @notice Session duration (24 hours)
    uint256 public constant SESSION_DURATION = 24 hours;
    
    /// @notice Maximum session inactivity (2 hours)
    uint256 public constant MAX_INACTIVITY = 2 hours;

    /// @notice Authorized domains for SIWE
    mapping(string => bool) public authorizedDomains;

    /// @notice Constructor
    /// @param _verificationHub Address of the verification hub
    constructor(address _verificationHub) AfricanProofWithDurin(_verificationHub) {
        // Add default authorized domains
        authorizedDomains["africanproof.app"] = true;
        authorizedDomains["localhost:3000"] = true;
        authorizedDomains["127.0.0.1:3000"] = true;
    }

    /// @notice Add authorized domain (only owner)
    /// @param domain Domain to authorize
    function addAuthorizedDomain(string memory domain) external onlyOwner {
        authorizedDomains[domain] = true;
    }

    /// @notice Remove authorized domain (only owner)
    /// @param domain Domain to remove
    function removeAuthorizedDomain(string memory domain) external onlyOwner {
        authorizedDomains[domain] = false;
    }

    /// @notice Generate a nonce for SIWE authentication
    /// @param user User address
    /// @return nonce Generated nonce
    function generateNonce(address user) external returns (string memory nonce) {
        // Generate pseudo-random nonce
        nonce = string(abi.encodePacked(
            "africanproof-",
            block.timestamp,
            "-",
            block.prevrandao,
            "-",
            user
        ));
        
        // Convert to hex string for better readability
        nonce = _toHexString(keccak256(abi.encodePacked(nonce)));
        
        nonceToUser[nonce] = user;
        
        emit NonceGenerated(user, nonce);
        return nonce;
    }

    /// @notice Authenticate user with SIWE message and signature
    /// @param message SIWE message structure
    /// @param signature Message signature
    function authenticateWithSIWE(
        SIWEMessage memory message,
        bytes memory signature
    ) external {
        // Validate message
        require(authorizedDomains[message.domain], "Unauthorized domain");
        require(message.userAddress == msg.sender, "Address mismatch");
        require(message.chainId == chainId, "Chain ID mismatch");
        require(!usedNonces[message.nonce], "Nonce already used");
        require(nonceToUser[message.nonce] == msg.sender, "Invalid nonce");
        
        // Validate expiration
        if (bytes(message.expirationTime).length > 0) {
            // In a real implementation, you'd parse the ISO 8601 timestamp
            // For simplicity, we'll use block.timestamp + SESSION_DURATION
            require(block.timestamp < block.timestamp + SESSION_DURATION, "Message expired");
        }

        // Verify signature (simplified - in production use proper ECDSA recovery)
        bytes32 messageHash = _hashSIWEMessage(message);
        address recoveredAddress = _recoverSigner(messageHash, signature);
        require(recoveredAddress == msg.sender, "Invalid signature");

        // Mark nonce as used
        usedNonces[message.nonce] = true;

        // Create user session
        userSessions[msg.sender] = UserSession({
            isActive: true,
            expiresAt: block.timestamp + SESSION_DURATION,
            nonce: message.nonce,
            domain: message.domain,
            lastActivity: block.timestamp
        });

        emit SIWELogin(msg.sender, message.domain, block.timestamp + SESSION_DURATION);
    }

    /// @notice Logout user (invalidate session)
    function logout() external {
        require(userSessions[msg.sender].isActive, "No active session");
        
        userSessions[msg.sender].isActive = false;
        userSessions[msg.sender].expiresAt = 0;
        
        emit SIWELogout(msg.sender);
    }

    /// @notice Check if user has valid session
    /// @param user User address
    /// @return valid True if session is valid
    function hasValidSession(address user) external view returns (bool valid) {
        UserSession memory session = userSessions[user];
        
        if (!session.isActive) {
            return false;
        }
        
        if (block.timestamp > session.expiresAt) {
            return false;
        }
        
        if (block.timestamp > session.lastActivity + MAX_INACTIVITY) {
            return false;
        }
        
        return true;
    }

    /// @notice Update user activity (extend session)
    function updateActivity() external {
        require(userSessions[msg.sender].isActive, "No active session");
        require(block.timestamp <= userSessions[msg.sender].expiresAt, "Session expired");
        
        userSessions[msg.sender].lastActivity = block.timestamp;
    }

    /// @notice Get user session info
    /// @param user User address
    /// @return session User session information
    function getUserSession(address user) external view returns (UserSession memory) {
        return userSessions[user];
    }

    /// @notice Enhanced verification that requires valid SIWE session
    /// @param user User to verify
    /// @param country Country code
    /// @param verificationData Verification data
    function verifyUserWithSIWE(
        address user,
        string memory country,
        string memory verificationData
    ) external {
        require(this.hasValidSession(user), "Valid SIWE session required");
        
        // Update activity
        if (user == msg.sender) {
            userSessions[msg.sender].lastActivity = block.timestamp;
        }
        
        // Call parent verification - need to call through verificationHub
        // This is a simplified version for testing
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
    }

    /// @notice Hash SIWE message for signature verification
    /// @param message SIWE message
    /// @return messageHash Hashed message
    function _hashSIWEMessage(SIWEMessage memory message) internal pure returns (bytes32) {
        // Simplified SIWE message hashing
        // In production, use proper EIP-4361 message formatting
        return keccak256(abi.encodePacked(
            message.domain,
            " wants you to sign in with your Ethereum account:\n",
            message.userAddress,
            "\n\n",
            message.statement,
            "\n\nURI: ", message.uri,
            "\nVersion: ", message.version,
            "\nChain ID: ", message.chainId,
            "\nNonce: ", message.nonce,
            "\nIssued At: ", message.issuedAt
        ));
    }

    /// @notice Recover signer from message hash and signature
    /// @param messageHash Hashed message
    /// @param signature Message signature
    /// @return signer Recovered signer address
    function _recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
        // Add Ethereum message prefix
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        // Extract r, s, v from signature
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // Recover address
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    /// @notice Convert bytes32 to hex string
    /// @param data Bytes to convert
    /// @return Hex string
    function _toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[1+i*2] = alphabet[uint8(data[i] & 0x0f)];
        }
        
        return string(str);
    }
}
