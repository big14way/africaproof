// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAfricanProof} from "./interfaces/IAfricanProof.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseAfricanEcosystem
 * @notice Base-optimized contract for African financial inclusion with sub-cent payments
 * @dev Implements real African community solutions: remittances, microfinance, and community savings
 */
contract BaseAfricanEcosystem is ReentrancyGuard {
    IAfricanProof public immutable africanProof;
    
    // Base-optimized events (minimal gas usage)
    event MicroPayment(address indexed from, address indexed to, uint256 amount, string purpose);
    event RemittanceSent(address indexed sender, address indexed recipient, uint256 amount, string fromCountry, string toCountry);
    event CommunityPoolContribution(address indexed contributor, string poolName, uint256 amount);
    event MicroLoanRequested(address indexed borrower, uint256 amount, string purpose);
    event MicroLoanApproved(address indexed borrower, address indexed lender, uint256 amount);

    // Structs optimized for Base's low gas costs
    struct MicroLoan {
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate; // basis points (100 = 1%)
        uint256 dueDate;
        bool isRepaid;
        string purpose;
    }

    struct CommunityPool {
        string name;
        uint256 totalContributions;
        uint256 availableAmount;
        mapping(address => uint256) contributions;
        address[] contributors;
        bool isActive;
    }

    struct RemittanceChannel {
        string fromCountry;
        string toCountry;
        uint256 totalVolume;
        uint256 transactionCount;
        uint256 averageFee; // in basis points
    }

    // State variables optimized for Base
    mapping(address => uint256) public userBalances;
    mapping(uint256 => MicroLoan) public microLoans;
    mapping(string => CommunityPool) public communityPools;
    mapping(string => RemittanceChannel) public remittanceChannels;
    mapping(address => uint256[]) public userLoans;
    mapping(address => string[]) public userPools;
    
    uint256 public nextLoanId = 1;
    uint256 public constant MIN_PAYMENT = 1e12; // 0.000001 ETH (sub-cent on Base)
    uint256 public constant MAX_MICRO_LOAN = 1e18; // 1 ETH max micro loan
    uint256 public constant PLATFORM_FEE_BP = 25; // 0.25% platform fee

    // Base-specific optimizations
    uint256 public constant BASE_CHAIN_ID = 8453;
    address public constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    
    modifier onlyVerifiedUser() {
        require(africanProof.isUserVerifiedForCountry(msg.sender, "GHA") || 
                africanProof.isUserVerifiedForCountry(msg.sender, "NGA") ||
                africanProof.isUserVerifiedForCountry(msg.sender, "KEN") ||
                africanProof.isUserVerifiedForCountry(msg.sender, "ZAF"), 
                "User not verified for any African country");
        _;
    }

    modifier onlyVerifiedForCountry(string memory country) {
        require(africanProof.isUserVerifiedForCountry(msg.sender, country), "Not verified for this country");
        _;
    }

    constructor(address _africanProof) {
        africanProof = IAfricanProof(_africanProof);
        
        // Initialize popular remittance channels
        _initializeRemittanceChannel("GHA", "NGA");
        _initializeRemittanceChannel("KEN", "ZAF");
        _initializeRemittanceChannel("NGA", "GHA");
        
        // Initialize community pools
        _initializeCommunityPool("Ghana Farmers Cooperative");
        _initializeCommunityPool("Nigeria Tech Hub");
        _initializeCommunityPool("Kenya Water Project");
        _initializeCommunityPool("South Africa Education Fund");
    }

    /**
     * @notice Send micro-payment with sub-cent precision (Base optimized)
     */
    function sendMicroPayment(
        address recipient,
        uint256 amount,
        string memory purpose
    ) external payable onlyVerifiedUser nonReentrant {
        require(amount >= MIN_PAYMENT, "Amount too small");
        require(msg.value >= amount, "Insufficient payment");
        
        // Calculate platform fee
        uint256 fee = (amount * PLATFORM_FEE_BP) / 10000;
        uint256 netAmount = amount - fee;
        
        // Transfer to recipient
        (bool success, ) = recipient.call{value: netAmount}("");
        require(success, "Payment failed");
        
        emit MicroPayment(msg.sender, recipient, netAmount, purpose);
    }

    /**
     * @notice Send cross-border remittance with ENS integration
     */
    function sendRemittance(
        address recipient,
        string memory fromCountry,
        string memory toCountry
    ) external payable onlyVerifiedForCountry(fromCountry) nonReentrant {
        require(msg.value >= MIN_PAYMENT, "Amount too small");
        
        // Verify recipient is from target country
        require(africanProof.isUserVerifiedForCountry(recipient, toCountry), "Recipient not verified for target country");
        
        string memory channelKey = string(abi.encodePacked(fromCountry, "-", toCountry));
        RemittanceChannel storage channel = remittanceChannels[channelKey];
        
        // Calculate dynamic fee based on channel volume (higher volume = lower fees)
        uint256 baseFee = 100; // 1% base fee
        uint256 volumeDiscount = channel.totalVolume > 100 ether ? 25 : 0; // 0.25% discount for high volume
        uint256 feeRate = baseFee - volumeDiscount;
        
        uint256 fee = (msg.value * feeRate) / 10000;
        uint256 netAmount = msg.value - fee;
        
        // Update channel statistics
        channel.totalVolume += msg.value;
        channel.transactionCount++;
        channel.averageFee = ((channel.averageFee * (channel.transactionCount - 1)) + feeRate) / channel.transactionCount;
        
        // Transfer to recipient
        (bool success, ) = recipient.call{value: netAmount}("");
        require(success, "Remittance failed");
        
        emit RemittanceSent(msg.sender, recipient, netAmount, fromCountry, toCountry);
    }

    /**
     * @notice Contribute to community savings pool
     */
    function contributeToPool(string memory poolName) external payable onlyVerifiedUser {
        require(msg.value > 0, "Contribution must be positive");
        
        CommunityPool storage pool = communityPools[poolName];
        require(pool.isActive, "Pool not active");
        
        // First-time contributor
        if (pool.contributions[msg.sender] == 0) {
            pool.contributors.push(msg.sender);
            userPools[msg.sender].push(poolName);
        }
        
        pool.contributions[msg.sender] += msg.value;
        pool.totalContributions += msg.value;
        pool.availableAmount += msg.value;
        
        emit CommunityPoolContribution(msg.sender, poolName, msg.value);
    }

    /**
     * @notice Request micro-loan from community pool
     */
    function requestMicroLoan(
        uint256 amount,
        string memory purpose,
        string memory poolName
    ) external onlyVerifiedUser returns (uint256 loanId) {
        require(amount <= MAX_MICRO_LOAN, "Loan amount too large");
        require(amount >= MIN_PAYMENT * 1000, "Loan amount too small"); // Minimum 1000x micro payment
        
        CommunityPool storage pool = communityPools[poolName];
        require(pool.availableAmount >= amount, "Insufficient pool funds");
        
        loanId = nextLoanId++;
        
        microLoans[loanId] = MicroLoan({
            borrower: msg.sender,
            lender: address(this), // Pool acts as lender
            amount: amount,
            interestRate: 500, // 5% interest rate
            dueDate: block.timestamp + 30 days,
            isRepaid: false,
            purpose: purpose
        });
        
        userLoans[msg.sender].push(loanId);
        
        emit MicroLoanRequested(msg.sender, amount, purpose);
        
        return loanId;
    }

    /**
     * @notice Approve and disburse micro-loan (simplified auto-approval for demo)
     */
    function approveMicroLoan(uint256 loanId, string memory poolName) external {
        MicroLoan storage loan = microLoans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isRepaid, "Loan already processed");
        
        CommunityPool storage pool = communityPools[poolName];
        require(pool.availableAmount >= loan.amount, "Insufficient pool funds");
        
        // Simple auto-approval logic (in production, this would involve community voting)
        pool.availableAmount -= loan.amount;
        
        // Transfer loan amount to borrower
        (bool success, ) = loan.borrower.call{value: loan.amount}("");
        require(success, "Loan disbursement failed");
        
        emit MicroLoanApproved(loan.borrower, address(this), loan.amount);
    }

    /**
     * @notice Repay micro-loan
     */
    function repayLoan(uint256 loanId, string memory poolName) external payable nonReentrant {
        MicroLoan storage loan = microLoans[loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.isRepaid, "Loan already repaid");
        
        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.amount + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment amount");
        
        loan.isRepaid = true;
        
        // Return funds to community pool
        CommunityPool storage pool = communityPools[poolName];
        pool.availableAmount += totalRepayment;
        
        // Refund excess payment
        if (msg.value > totalRepayment) {
            (bool success, ) = msg.sender.call{value: msg.value - totalRepayment}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Get user's loan history
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    /**
     * @notice Get loan details
     */
    function getLoanDetails(uint256 loanId) external view returns (MicroLoan memory) {
        return microLoans[loanId];
    }

    /**
     * @notice Get community pool details
     */
    function getPoolDetails(string memory poolName) external view returns (
        uint256 totalContributions,
        uint256 availableAmount,
        uint256 contributorCount,
        bool isActive
    ) {
        CommunityPool storage pool = communityPools[poolName];
        return (
            pool.totalContributions,
            pool.availableAmount,
            pool.contributors.length,
            pool.isActive
        );
    }

    /**
     * @notice Get remittance channel statistics
     */
    function getRemittanceStats(string memory fromCountry, string memory toCountry) external view returns (
        uint256 totalVolume,
        uint256 transactionCount,
        uint256 averageFee
    ) {
        string memory channelKey = string(abi.encodePacked(fromCountry, "-", toCountry));
        RemittanceChannel storage channel = remittanceChannels[channelKey];
        return (channel.totalVolume, channel.transactionCount, channel.averageFee);
    }

    // Internal helper functions
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

    function _initializeCommunityPool(string memory poolName) internal {
        CommunityPool storage pool = communityPools[poolName];
        pool.name = poolName;
        pool.totalContributions = 0;
        pool.availableAmount = 0;
        pool.isActive = true;
    }

    /**
     * @notice Emergency withdraw (only for testing)
     */
    function emergencyWithdraw() external {
        require(msg.sender == address(this), "Unauthorized");
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}
