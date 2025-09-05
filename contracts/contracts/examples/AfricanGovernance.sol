// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAfricanProof} from "../interfaces/IAfricanProof.sol";

contract AfricanGovernance {
    IAfricanProof public africanProof;
    
    struct Proposal {
        string title;
        uint256 forVotes;
        uint256 againstVotes;
        bool active;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 proposalId, string title);
    event VoteCast(address voter, uint256 proposalId, bool support);
    
    modifier onlyGhanaian() {
        require(
            africanProof.isUserVerifiedForCountry(msg.sender, "GHA"),
            "Only Ghanaian users can vote"
        );
        _;
    }

    constructor(address _africanProof) {
        africanProof = IAfricanProof(_africanProof);
    }
    
    function createProposal(string memory title) external {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            title: title,
            forVotes: 0,
            againstVotes: 0,
            active: true
        });
        
        emit ProposalCreated(proposalCount, title);
    }
    
    function vote(uint256 proposalId, bool support) external onlyGhanaian {
        require(proposals[proposalId].active, "Proposal not active");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposals[proposalId].forVotes++;
        } else {
            proposals[proposalId].againstVotes++;
        }
        
        emit VoteCast(msg.sender, proposalId, support);
    }
    
    function getProposal(uint256 proposalId) external view returns (
        string memory title,
        uint256 forVotes,
        uint256 againstVotes,
        bool active
    ) {
        Proposal memory proposal = proposals[proposalId];
        return (
            proposal.title,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.active
        );
    }
}
