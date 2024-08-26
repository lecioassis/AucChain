// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./Auction.sol";

contract AuctionFactory {
    address[] public auctions;

    event AuctionCreated(address indexed auctionAddress);

    function createAuction(
        uint _startBlock,
        uint _endBlock,
        uint _revealEndBlock,
        string memory _ipfsHash
    ) external returns (address auctionAddress) {
        Auction newAuction = new Auction(
            _startBlock,
            _endBlock,
            _revealEndBlock,
            _ipfsHash
        );
        auctionAddress = address(newAuction);
        auctions.push(auctionAddress);
        emit AuctionCreated(auctionAddress);
    }

    function getAllAuctions() external view returns (address[] memory auctionList) {
        return auctions;
    }
}
