// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./Auction.sol";

contract AuctionFactory {
    address[] public auctions;

    event AuctionCreated(address auctionAddress);

    function createAuction(
        uint _startBlock,
        uint _endBlock,
        uint _revealEndBlock,
        string memory _ipfsHash
    ) public returns (address) {
        Auction newAuction = new Auction(
            _startBlock,
            _endBlock,
            _revealEndBlock,
            _ipfsHash
        );
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction));
        return address(newAuction);
    }

    function getAllAuctions() public view returns (address[] memory) {
        return auctions;
    }
}
