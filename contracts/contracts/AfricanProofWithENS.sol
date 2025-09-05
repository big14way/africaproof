// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {MockSelfVerificationRoot} from "../contracts/mocks/MockSelfVerificationRoot.sol";
import {MockStringUtils} from "../contracts/mocks/MockStringUtils.sol";
import {MockSelfStructs} from "../contracts/mocks/MockSelfVerificationRoot.sol";

// import {IL2Registry} from "./interfaces/IL2Registry.sol"; // Commented out for now
/**
 * @title AfricanProof
 * @notice Implementation of SelfVerificationRoot for African identity verification
 * @dev This contract provides a concrete implementation of the abstract SelfVerificationRoot for African countries
 */
contract AfricanProof is MockSelfVerificationRoot {
     using MockStringUtils for string;


    bool public verificationSuccessful;
    MockSelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    string  public lastUserData;
    MockSelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;
       

    // Doing this because Reverse Lookup isnt achieved in the L2 registry.
    mapping(address => mapping(string => bool)) public userCountryVerification;

    /**
     * @notice Check if user is verified for specific country
     */
    function isUserVerifiedForCountry(address user, string memory country) external view returns (bool) {
        return userCountryVerification[user][country];
    }


  /// @notice Maps nullifiers to user identifiers for registration tracking
    mapping(uint256 nullifier => uint256 userIdentifier) internal _nullifierToUserIdentifier;

 /// @notice Reverts when a nullifier has already been registered
    error AlreadyRegistered();
    /// @notice The chainId for the current chain
    uint256 public chainId;

    /// @notice The coinType for the current chain (ENSIP-11)
    uint256 public immutable coinType;

    mapping (string => address) registryAddress;



    // Events for testing
    event VerificationCompleted(
        MockSelfVerificationRoot.GenericDiscloseOutputV2 output,
        string userData,
        string country,
        uint256 coinType
    );

    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     */
    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId
    ) MockSelfVerificationRoot(identityVerificationHubV2Address, scope) {
        verificationConfigId = _verificationConfigId;
         assembly {
            sstore(chainId.slot, chainid())
        }

        // Calculate the coinType for the current chain according to ENSIP-11
        coinType = (0x80000000 | chainId) >> 0;

    }
    /**
     * @notice Implementation of customVerificationHook for testing
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        MockSelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
             // Commented this for DEMO -> In Production this will be enabled
             
        // if (_nullifierToUserIdentifier[output.nullifier] != 0) {
        //     revert AlreadyRegistered();
        // }
        
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = string(userData);
        lastUserAddress = address(uint160(output.userIdentifier));
        string memory country = output.nationality;


        
        bytes memory addr = abi.encodePacked(lastUserAddress); // Convert address to bytes

      

        // ENS Registry functionality (commented out for now - can be enabled later)
        /*
        // Check if registry exists for this country
        address registryAddr = registryAddress[country];
        require(registryAddr != address(0), "No registry set for this country");
        IL2Registry registry = IL2Registry(registryAddr);
        bytes32 node = _labelToNode(lastUserData, registryAddr);
        // Set the forward address for the current chain. This is needed for reverse resolution.
        // E.g. if this contract is deployed to Base, set an address for chainId 8453 which is
        // coinType 2147492101 according to ENSIP-11.
        registry.setAddr(node, coinType, addr);

        // Set the forward address for mainnet ETH (coinType 60) for easier debugging.
        registry.setAddr(node, 60, addr);


        // Register the name in the L2 registry
        registry.createSubnode(
            registry.baseNode(),
            lastUserData,
            lastUserAddress,
            new bytes[](0)
        );
        */

       

        
        userCountryVerification[lastUserAddress][country] = true;
        emit VerificationCompleted(output, string(userData),country,coinType);
    }

    /**
     * @notice Reset the test state
     */
    function resetTestState() external {
        verificationSuccessful = false;
        lastOutput = MockSelfVerificationRoot.GenericDiscloseOutputV2({
            attestationId: bytes32(0),
            userIdentifier: 0,
            nullifier: 0,
            forbiddenCountriesListPacked: [
                uint256(0),
                uint256(0),
                uint256(0),
                uint256(0)
            ],
            issuingState: "",
            name: [string(""), string(""), string("")],
            idNumber: "",
            nationality: "",
            dateOfBirth: "",
            gender: "",
            expiryDate: "",
            olderThan: 0,
            ofac: [false, false, false]
        });
        lastUserData = "";
        lastUserAddress = address(0);
    }

    /**
     * @notice Expose the internal _setScope function for testing
     * @param newScope The new scope value to set
     */
    function setScope(uint256 newScope) external {
        _setScope(newScope);
    }

    function setVerificationConfig(
        MockSelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
        // Note: Mock implementation - in production this would call the hub
    }

    function setVerificationConfigNoHub(
        MockSelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
    }

    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }




    // ENS-related functions (commented out for now - can be enabled later)
    /*
    /// @notice Checks if a given label is available for registration
    /// @dev Uses try-catch to handle the ERC721NonexistentToken error
    /// @param label The label to check availability for
    /// @return available True if the label can be registered, false if already taken
    function available(string calldata label , address _registry) external view returns (bool) {
        bytes32 node = _labelToNode(label, _registry);
        uint256 tokenId = uint256(node);
        IL2Registry registry = IL2Registry(_registry);
        try registry.ownerOf(tokenId) {
            return false;
        } catch {
            if (label.strlen() >= 3) {
                return true;
            }
            return false;
        }
    }

    function _labelToNode(
        string memory label,
        address _registryAddress
    ) private view returns (bytes32) {
        IL2Registry _registry = IL2Registry(_registryAddress);
        return _registry.makeNode(_registry.baseNode(), label);
    }
    */

  function _setRegistry(string memory country, address _registryAddress) external {
    require(_registryAddress != address(0), "Invalid registry address"); 
    require(bytes(country).length > 0, "Country cannot be empty");
    registryAddress[country] = _registryAddress;
}




}