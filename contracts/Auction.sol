// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

contract Auction {
    // Static state variables
    address public immutable owner;
    uint public immutable startBlock;
    uint public immutable endBlock;
    string public ipfsHash;
    uint public immutable bidIncrement;

    // Dynamic state variables
    bool public canceled;
    address public highestBidder;
    mapping(address => uint256) public fundsByBidder;
    uint public highestBindingBid;
    bool public ownerHasWithdrawn;
    bool public winnerHasClaimed;

    event LogBid(address indexed bidder, uint bid, address indexed highestBidder, uint highestBid, uint highestBindingBid);
    event LogWithdrawal(address indexed withdrawer, address indexed withdrawalAccount, uint amount);
    event LogCanceled();

    constructor(
        address _owner,
        uint _bidIncrement,
        uint _startBlock,
        uint _endBlock,
        string memory _ipfsHash
    ) {
        require(_startBlock < _endBlock, "Ending Block must be greater than Starting Block.");
        require(_startBlock >= block.number, string(abi.encodePacked("Starting Block must be greater or equal to the Current Block number.")));
        require(_owner != address(0), "Owner address cannot be zero address.");

        owner = _owner;
        bidIncrement = _bidIncrement;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfsHash;
    }

    function getHighestBid() public view returns (uint) {
        return fundsByBidder[highestBidder];
    }

    function placeBid() external payable onlyAfterStart onlyBeforeEnd onlyNotCanceled onlyNotOwner returns (bool success) {
        require(msg.value > 0, "Bid amount must be greater than zero.");

        uint newBid = fundsByBidder[msg.sender] + msg.value;
        require(newBid > highestBindingBid, "Bid must be greater than the highest binding bid.");

        uint highestBid = fundsByBidder[highestBidder];
        fundsByBidder[msg.sender] = newBid;

        if (newBid <= highestBid) {
            highestBindingBid = min(newBid + bidIncrement, highestBid);
        } else {
            if (msg.sender != highestBidder) {
                highestBidder = msg.sender;
                highestBindingBid = min(newBid, highestBid + bidIncrement);
            }
        }

        emit LogBid(msg.sender, newBid, highestBidder, highestBid, highestBindingBid);
        return true;
    }

    function withdraw() external onlyEndedOrCanceled returns (bool) {
        uint withdrawalAmount;
        address withdrawalAccount = msg.sender;

        if (canceled) {
            withdrawalAmount = fundsByBidder[withdrawalAccount];
        } else if (msg.sender == owner) {
            withdrawalAccount = highestBidder;
            withdrawalAmount = highestBindingBid;
            ownerHasWithdrawn = true;
        } else if (msg.sender == highestBidder) {
            withdrawalAmount = fundsByBidder[highestBidder] - (ownerHasWithdrawn ? highestBindingBid : 0);
        } else {
            withdrawalAmount = fundsByBidder[withdrawalAccount];
        }

        require(withdrawalAmount > 0, "Withdrawal amount must be greater than zero.");
        fundsByBidder[withdrawalAccount] -= withdrawalAmount;
        
        (bool transferSuccess, ) = payable(withdrawalAccount).call{value: withdrawalAmount}("");
        require(transferSuccess, "Transfer failed.");

        emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);
        return true;
    }

    function claimItem () external view onlyWinner returns (bool) {
        winnerHasClaimed == true;
        return true;
    }

    function cancelAuction() public onlyOwner onlyBeforeEnd onlyNotCanceled returns (bool) {
        canceled = true;
        emit LogCanceled();
        return true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner.");
        _;
    }

    modifier onlyNotOwner() {
        require(msg.sender != owner, "Caller is the owner.");
        _;
    }

    modifier onlyWinner() {
        require(msg.sender == highestBidder, "Caller is not the owner.");
        _;
    }

    modifier onlyAfterStart() {
        require(block.number >= startBlock, "Auction has not started.");
        _;
    }

    modifier onlyBeforeEnd() {
        require(block.number <= endBlock, "Auction has ended.");
        _;
    }

    modifier onlyNotCanceled() {
        require(!canceled, "Auction has been canceled.");
        _;
    }

    modifier onlyEndedOrCanceled() {
        require(block.number >= endBlock || canceled, "Auction is not ended or canceled.");
        _;
    }

    function min(uint a, uint b) internal pure returns (uint) {
        return (a < b) ? a : b;
    }

    modifier onlyClaimed {
        require(winnerHasClaimed);
        _;
    }
}