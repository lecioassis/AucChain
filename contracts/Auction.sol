contract Auction {
    // static
    address public owner;
    uint public startBlock;
    uint public endBlock;
    string public ipfsHash;
    uint public bidIncrement;

    // state
    bool public canceled;
    address public highestBidder;
    mapping(address => uint256) public fundsByBidder;
    uint public highestBindingBid;
    bool ownerHasWithdrawn;

    event LogBid(address bidder, uint bid, address highestBidder, uint highestBid, uint highestBindingBid);
    event LogWithdrawal(address withdrawer, address withdrawalAccount, uint amount);
    event LogCanceled();

    constructor(address _owner, uint _bidIncrement, uint _startBlock, uint _endBlock, string memory _ipfsHash) {
        require(_startBlock < _endBlock, "Ending Block must be greater than Starting Block.");
        require(_startBlock >= block.number, "Starting Block must be greater or equal than the Current Block number.");
        require(owner != address(0), "Owner address cannot be zero address.");

        owner = _owner;
        bidIncrement = _bidIncrement;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfsHash;
    }

    function getHighestBid() 
        internal 
        returns (uint) 
    {
        return fundsByBidder[highestBidder];
    }

    function placeBid()
        public
        payable
        onlyAfterStart
        onlyBeforeEnd
        onlyNotCanceled
        onlyNotOwner
        returns (bool success)
    {
       
    }

    function withdraw() 
        internal
        onlyEndedOrCanceled
        returns (bool success) 
    {
        
    }

    function cancelAuction() 
        internal
        onlyOwner
        onlyBeforeEnd
        onlyNotCanceled
        returns (bool success) 
    {
        
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyNotOwner {
        require(msg.sender != owner);
        _;
    }

    modifier onlyAfterStart {
        require(block.number >= startBlock);
        _;
    }

    modifier onlyBeforeEnd {
        require (block.number <= endBlock);
        _;
    }

    modifier onlyNotCanceled {
        require(!canceled);
        _;
    }

    modifier onlyEndedOrCanceled {
        require(block.number >= endBlock || canceled);
        _;
    }
}