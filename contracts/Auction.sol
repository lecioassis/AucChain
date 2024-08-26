// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract Auction {
    // Static state variables
    address public immutable owner;
    uint public immutable startBlock;
    uint public immutable endBlock;
    uint public immutable revealEndBlock;
    string public ipfsHash;
    
    // Struct to store bid details
    struct Bid {
        bytes32 blindedBid;
        uint deposit;
    }

    // Dynamic state variables
    bool public canceled;
    address public highestBidder;
    mapping(address => Bid[]) public bids; // Updated to store an array of bids per address
    mapping(address => uint256) public fundsByBidder;
    uint public highestBindingBid;
    bool public winnerHasClaimed;
    bool public ownerHasWithdrawn;

    event LogBid(address indexed bidder, uint deposit, bytes32 blindedBid);
    event LogReveal(address indexed bidder, uint value);
    event LogWithdrawal(address indexed withdrawer, uint amount);
    event LogCanceled();

    constructor(
        uint _startBlock,
        uint _endBlock,
        uint _revealEndBlock,
        string memory _ipfsHash
    ) {
        require(_startBlock < _endBlock, "Ending Block must be greater than Starting Block.");
        require(_startBlock >= block.number, "Starting Block must be greater or equal to the Current Block number.");
        require(_endBlock < _revealEndBlock, "Reveal end block must be after auction end.");

        owner = msg.sender;
        startBlock = _startBlock;
        endBlock = _endBlock;
        revealEndBlock = _revealEndBlock;
        ipfsHash = _ipfsHash;
    }

    function placeBid(bytes32 _blindedBid) external payable onlyAfterStart onlyBeforeEnd onlyNotCanceled onlyNotOwner returns (bool success) {
        require(msg.value > 0, "Bid amount must be greater than zero.");

        // Add the new bid to the bidder's list of bids
        bids[msg.sender].push(Bid({
            blindedBid: _blindedBid,
            deposit: msg.value
        }));

        emit LogBid(msg.sender, msg.value, _blindedBid);
        return true;
    }

    function revealBid(uint _bidIndex, uint _value, string memory _secret) external onlyAfterEnd onlyBeforeRevealEnd onlyNotCanceled returns (bool success) {
        Bid[] storage bidArray = bids[msg.sender];
        require(_bidIndex < bidArray.length, "Invalid bid index.");
        
        Bid storage bidToCheck = bidArray[_bidIndex];
        require(bidToCheck.deposit > 0, "No bid to reveal.");

        bytes32 hash = keccak256(abi.encodePacked(_value, _secret));
        if (hash == bidToCheck.blindedBid) {
            require(bidToCheck.deposit >= _value, "Deposit must cover the bid value.");

            if (_value > highestBindingBid) {
                if (highestBidder != address(0)) {
                    fundsByBidder[highestBidder] += highestBindingBid;
                }
                highestBindingBid = _value;
                highestBidder = msg.sender;
            } else {
                fundsByBidder[msg.sender] += bidToCheck.deposit;
            }

            emit LogReveal(msg.sender, _value);
        } else {
            // If the bid was invalid, refund the deposit
            fundsByBidder[msg.sender] += bidToCheck.deposit;
        }

        // Clear the bid data after reveal
        bidToCheck.blindedBid = bytes32(0);
        bidToCheck.deposit = 0;

        return true;
    }

    function withdraw() external onlyEndedOrCanceled returns (bool) {
        uint withdrawalAmount;

        if (canceled) {
            // Sum up all deposits for the bidder to withdraw in case of auction cancellation
            Bid[] storage bidArray = bids[msg.sender];
            for (uint i = 0; i < bidArray.length; i++) {
                withdrawalAmount += bidArray[i].deposit;
            }
        } else if (msg.sender == highestBidder) {
            withdrawalAmount = fundsByBidder[msg.sender] - highestBindingBid;
            winnerHasClaimed = true;
        } else {
            withdrawalAmount = fundsByBidder[msg.sender];
        }

        require(withdrawalAmount > 0, "Withdrawal amount must be greater than zero.");
        fundsByBidder[msg.sender] = 0;
        
        (bool transferSuccess, ) = payable(msg.sender).call{value: withdrawalAmount}("");
        require(transferSuccess, "Transfer failed.");

        emit LogWithdrawal(msg.sender, withdrawalAmount);
        return true;
    }

    function finalizeAuction() external onlyOwner onlyWinner onlyAfterEnd onlyNotCanceled {
        require(winnerHasClaimed, "Winner must confirm receipt of the item.");

        uint fee = highestBindingBid / 100; // 1% fee for contract deployer
        uint payout = highestBindingBid - fee;

        (bool transferSuccess, ) = payable(owner).call{value: payout}("");
        require(transferSuccess, "Payout transfer failed.");

        ownerHasWithdrawn = true;
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

    modifier onlyAfterEnd() {
        require(block.number > endBlock, "Auction is still ongoing.");
        _;
    }

    modifier onlyBeforeRevealEnd() {
        require(block.number <= revealEndBlock, "Reveal period has ended.");
        _;
    }

    modifier onlyEndedOrCanceled() {
        require(block.number > revealEndBlock || canceled, "Auction is not ended or canceled.");
        _;
    }

    modifier onlyWinner() {
        require(msg.sender == highestBidder, "Caller is not the winner.");
        _;
    }
}
