// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAfricanProof} from "../interfaces/IAfricanProof.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DisasterRelief {
    IAfricanProof public africanProof;
    IERC20 public reliefToken;
    
    struct ReliefProgram {
        uint256 id;
        string name;
        uint256 amount;
        uint256 maxClaims;
        uint256 totalClaimed;
        bool active;
        uint256 startDate;
        uint256 endDate;
    }
    
    struct Claim {
        address claimant;
        uint256 programId;
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }
    
    uint256 public programCount;
    mapping(uint256 => ReliefProgram) public programs;
    mapping(uint256 => mapping(address => Claim)) public claims;
    mapping(address => uint256[]) public userClaims;
    
    event ReliefProgramCreated(uint256 programId, string name, uint256 amount, uint256 maxClaims);
    event ReliefClaimed(address indexed claimant, uint256 indexed programId, uint256 amount);
    event ReliefFunded(address indexed funder, uint256 amount, uint256 indexed programId);
    event ProgramStatusChanged(uint256 indexed programId, bool active);
    
    modifier onlyGhanaian() {
        require(
            africanProof.isUserVerifiedForCountry(msg.sender, "GHA"),
            "Only Ghanaian users can claim disaster relief"
        );
        _;
    }

    constructor(address _africanProof, address _reliefToken) {
        africanProof = IAfricanProof(_africanProof);
        reliefToken = IERC20(_reliefToken);
        // Create default program
        _createProgram("Ghana Disaster Relief", 1000 * 10**18, 1000); // 1000 tokens
    }
    
    function createProgram(
        string memory name,
        uint256 amount,
        uint256 maxClaims
    ) external returns (uint256) {
        return _createProgram(name, amount, maxClaims);
    }
    
    function _createProgram(
        string memory name,
        uint256 amount,
        uint256 maxClaims
    ) internal returns (uint256) {
        programCount++;
        uint256 programId = programCount;
        
        programs[programId] = ReliefProgram({
            id: programId,
            name: name,
            amount: amount,
            maxClaims: maxClaims,
            totalClaimed: 0,
            active: true,
            startDate: block.timestamp,
            endDate: block.timestamp + 365 days
        });
        
        emit ReliefProgramCreated(programId, name, amount, maxClaims);
        return programId;
    }
    
    function claimRelief(uint256 programId) external onlyGhanaian {
        ReliefProgram storage program = programs[programId];
        require(program.active, "Program not active");
        require(block.timestamp >= program.startDate, "Program not started");
        require(block.timestamp <= program.endDate, "Program expired");
        require(program.totalClaimed < program.maxClaims, "Maximum claims reached");
        require(reliefToken.balanceOf(address(this)) >= program.amount, "Insufficient tokens");
        
        Claim storage claim = claims[programId][msg.sender];
        require(!claim.claimed, "Already claimed from this program");
        
        claim.claimant = msg.sender;
        claim.programId = programId;
        claim.amount = program.amount;
        claim.timestamp = block.timestamp;
        claim.claimed = true;
        
        program.totalClaimed++;
        userClaims[msg.sender].push(programId);
        
        require(reliefToken.transfer(msg.sender, program.amount), "Token transfer failed");
        
        emit ReliefClaimed(msg.sender, programId, program.amount);
    }
    
    function fundRelief(uint256 programId, uint256 amount) external {
        require(amount > 0, "Must send tokens");
        require(programs[programId].id != 0, "Program does not exist");
        require(reliefToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        emit ReliefFunded(msg.sender, amount, programId);
    }
    
    function getProgram(uint256 programId) external view returns (
        uint256 id,
        string memory name,
        uint256 amount,
        uint256 maxClaims,
        uint256 totalClaimed,
        bool active,
        uint256 startDate,
        uint256 endDate
    ) {
        ReliefProgram memory program = programs[programId];
        return (
            program.id,
            program.name,
            program.amount,
            program.maxClaims,
            program.totalClaimed,
            program.active,
            program.startDate,
            program.endDate
        );
    }
    
    function getClaim(uint256 programId, address user) external view returns (
        address claimant,
        uint256 programId_,
        uint256 amount,
        uint256 timestamp,
        bool claimed
    ) {
        Claim memory claim = claims[programId][user];
        return (
            claim.claimant,
            claim.programId,
            claim.amount,
            claim.timestamp,
            claim.claimed
        );
    }
    
    function getUserClaims(address user) external view returns (uint256[] memory) {
        return userClaims[user];
    }
    
    function getRemainingClaims(uint256 programId) external view returns (uint256) {
        ReliefProgram memory program = programs[programId];
        return program.maxClaims - program.totalClaimed;
    }
    
    function setProgramStatus(uint256 programId, bool active) external {
        require(programs[programId].id != 0, "Program does not exist");
        programs[programId].active = active;
        emit ProgramStatusChanged(programId, active);
    }
    
    function getContractBalance() external view returns (uint256) {
        return reliefToken.balanceOf(address(this));
    }
    
    function getTokenAddress() external view returns (address) {
        return address(reliefToken);
    }

    function checkEligibility(address user) external view returns (bool) {
        return africanProof.isUserVerifiedForCountry(user, "GHA");
    }

}
