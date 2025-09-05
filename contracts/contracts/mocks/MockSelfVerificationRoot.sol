// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title MockSelfVerificationRoot
 * @notice Mock implementation of SelfVerificationRoot for testing and compilation
 * @dev This replaces the complex @selfxyz/contracts dependency
 */
abstract contract MockSelfVerificationRoot {
    struct GenericDiscloseOutputV2 {
        bytes32 attestationId;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
        string issuingState;
        string[3] name;
        string idNumber;
        string nationality;
        string dateOfBirth;
        string gender;
        string expiryDate;
        uint256 olderThan;
        bool[3] ofac;
    }

    struct VerificationConfigV2 {
        uint256 minimumAge;
        bool requireNationality;
        string[] allowedCountries;
        bool requireIdNumber;
        bool requireName;
    }

    // Events
    event VerificationSuccess(address indexed user, string nationality);
    event ScopeUpdated(uint256 newScope);

    // State variables
    address internal _identityVerificationHubV2;
    uint256 internal _scope;

    // Modifiers
    modifier onlyHub() {
        require(msg.sender == _identityVerificationHubV2, "Only hub can call this function");
        _;
    }

    constructor(address identityVerificationHubV2Address, uint256 scope) {
        _identityVerificationHubV2 = identityVerificationHubV2Address;
        _scope = scope;
    }

    /**
     * @notice Called by the hub when verification is successful
     * @param output The verification output data
     * @param userData Additional user data
     */
    function onVerificationSuccess(
        bytes memory output,
        bytes memory userData
    ) external onlyHub {
        GenericDiscloseOutputV2 memory decodedOutput = abi.decode(output, (GenericDiscloseOutputV2));
        customVerificationHook(decodedOutput, userData);
        emit VerificationSuccess(address(uint160(decodedOutput.userIdentifier)), decodedOutput.nationality);
    }

    /**
     * @notice Custom hook to be implemented by inheriting contracts
     * @param output The decoded verification output
     * @param userData Additional user data
     */
    function customVerificationHook(
        GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual;

    /**
     * @notice Get the configuration ID for verification
     * @param destinationChainId The destination chain ID
     * @param userIdentifier The user identifier
     * @param userDefinedData User defined data
     * @return The configuration ID
     */
    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view virtual returns (bytes32);

    /**
     * @notice Set the scope for verification
     * @param newScope The new scope value
     */
    function _setScope(uint256 newScope) internal {
        _scope = newScope;
        emit ScopeUpdated(newScope);
    }

    /**
     * @notice Get the current scope
     * @return The current scope value
     */
    function getScope() external view returns (uint256) {
        return _scope;
    }

    /**
     * @notice Get the hub address
     * @return The hub address
     */
    function getHub() external view returns (address) {
        return _identityVerificationHubV2;
    }
}

/**
 * @title MockIdentityVerificationHubV2
 * @notice Mock hub interface for testing
 */
interface MockIdentityVerificationHubV2 {
    function setVerificationConfigV2(MockSelfVerificationRoot.VerificationConfigV2 memory config) external;
    function verifyUser(address user, bytes memory data) external;
}

/**
 * @title MockSelfStructs
 * @notice Mock structs library
 */
library MockSelfStructs {
    struct VerificationConfigV2 {
        uint256 minimumAge;
        bool requireNationality;
        string[] allowedCountries;
        bool requireIdNumber;
        bool requireName;
    }
}
