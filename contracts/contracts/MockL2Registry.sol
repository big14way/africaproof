// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title MockL2Registry
/// @notice Mock implementation of Durin L2Registry for testing
/// @dev Simplified version for testing AfricanProof integration
contract MockL2Registry is ERC721 {
    
    /// @notice Base node for this registry
    bytes32 public baseNode;
    
    /// @notice Mapping from node to name
    mapping(bytes32 => bytes) public names;
    
    /// @notice Mapping from node to address records (coinType => address)
    mapping(bytes32 => mapping(uint256 => bytes)) public addresses;
    
    /// @notice Mapping from node to text records
    mapping(bytes32 => mapping(string => string)) public textRecords;
    
    /// @notice Mapping of authorized registrars
    mapping(address => bool) public registrars;
    
    /// @notice Owner of the registry
    address public owner;
    
    /// @notice Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @notice Events
    event SubnodeCreated(bytes32 indexed node, string label, address owner);
    event AddressChanged(bytes32 indexed node, uint256 coinType, bytes addr);
    event TextChanged(bytes32 indexed node, string key, string value);

    /// @notice Constructor
    constructor() ERC721("MockL2Registry", "ML2R") {
        owner = msg.sender;
        baseNode = keccak256(abi.encodePacked(bytes32(0), keccak256("gwill")));
        registrars[msg.sender] = true;
    }

    /// @notice Modifier to check if caller is authorized registrar
    modifier onlyRegistrar() {
        require(registrars[msg.sender], "Not authorized registrar");
        _;
    }

    /// @notice Modifier to check if caller is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Add a registrar
    /// @param registrar Address to add as registrar
    function addRegistrar(address registrar) external onlyOwner {
        registrars[registrar] = true;
    }

    /// @notice Remove a registrar
    /// @param registrar Address to remove as registrar
    function removeRegistrar(address registrar) external onlyOwner {
        registrars[registrar] = false;
    }

    /// @notice Create a subnode
    /// @param node Parent node
    /// @param label Label for the subnode
    /// @param nodeOwner Owner of the new subnode
    /// @param data Additional data (unused in mock)
    /// @return newNode The created node
    function createSubnode(
        bytes32 node,
        string calldata label,
        address nodeOwner,
        bytes[] calldata data
    ) external onlyRegistrar returns (bytes32 newNode) {
        newNode = makeNode(node, label);
        
        // Mint NFT for the subnode
        uint256 tokenId = uint256(newNode);
        _mint(nodeOwner, tokenId);
        
        // Store the name
        names[newNode] = abi.encodePacked(label);
        
        emit SubnodeCreated(newNode, label, nodeOwner);
        return newNode;
    }

    /// @notice Set address record for a node
    /// @param node Node to set address for
    /// @param coinType Coin type (ENSIP-11)
    /// @param addrBytes Address bytes
    function setAddr(bytes32 node, uint256 coinType, bytes calldata addrBytes) external {
        require(_isApprovedOrOwner(msg.sender, uint256(node)), "Not authorized");
        
        addresses[node][coinType] = addrBytes;
        emit AddressChanged(node, coinType, addrBytes);
    }

    /// @notice Set text record for a node
    /// @param node Node to set text record for
    /// @param key Text record key
    /// @param value Text record value
    function setText(bytes32 node, string calldata key, string calldata value) external {
        require(_isApprovedOrOwner(msg.sender, uint256(node)), "Not authorized");
        
        textRecords[node][key] = value;
        emit TextChanged(node, key, value);
    }

    /// @notice Get address record for a node
    /// @param node Node to get address for
    /// @param coinType Coin type
    /// @return Address bytes
    function addr(bytes32 node, uint256 coinType) external view returns (bytes memory) {
        return addresses[node][coinType];
    }

    /// @notice Get text record for a node
    /// @param node Node to get text record for
    /// @param key Text record key
    /// @return Text record value
    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return textRecords[node][key];
    }

    /// @notice Make a node hash from parent and label
    /// @param parentNode Parent node
    /// @param label Label
    /// @return Node hash
    function makeNode(bytes32 parentNode, string calldata label) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(parentNode, keccak256(bytes(label))));
    }

    /// @notice Get the base node
    /// @return Base node hash
    function getBaseNode() external view returns (bytes32) {
        return baseNode;
    }

    /// @notice Check if a token exists (for availability checking)
    /// @param tokenId Token ID to check
    /// @return True if token exists
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /// @notice Override ownerOf to handle non-existent tokens
    /// @param tokenId Token ID
    /// @return Owner address
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address tokenOwner = _ownerOf(tokenId);
        if (tokenOwner == address(0)) {
            revert("ERC721: invalid token ID");
        }
        return tokenOwner;
    }

    /// @notice Get name for a node
    /// @param node Node hash
    /// @return Name bytes
    function getName(bytes32 node) external view returns (bytes memory) {
        return names[node];
    }

    /// @notice Check if address is authorized registrar
    /// @param registrar Address to check
    /// @return True if authorized
    function isRegistrar(address registrar) external view returns (bool) {
        return registrars[registrar];
    }

    /// @notice Namehash function (simplified)
    /// @param name Domain name
    /// @return Node hash
    function namehash(string calldata name) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }

    /// @notice Decode name from bytes
    /// @param name Name bytes
    /// @return Decoded name string
    function decodeName(bytes calldata name) external pure returns (string memory) {
        return string(name);
    }

    /// @notice Initialize function (for compatibility)
    /// @param tokenName Token name
    /// @param tokenSymbol Token symbol
    /// @param baseURI Base URI
    /// @param admin Admin address
    function initialize(
        string calldata tokenName,
        string calldata tokenSymbol,
        string calldata baseURI,
        address admin
    ) external {
        // Mock initialization - in real implementation this would set up the contract
        owner = admin;
    }

    /// @notice Set base URI (mock)
    /// @param baseURI New base URI
    function setBaseURI(string calldata baseURI) external onlyOwner {
        // Mock function - would set base URI for metadata
    }

    /// @notice Override _isApprovedOrOwner to handle registrar permissions
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        if (registrars[spender]) {
            return true;
        }

        address tokenOwner = _ownerOf(tokenId);
        return (spender == tokenOwner || getApproved(tokenId) == spender || isApprovedForAll(tokenOwner, spender));
    }
}
