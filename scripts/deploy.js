// scripts/deploy.js

const { ethers } = require("hardhat");

async function main() {
    // Get the ContractFactory and Signers
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy AuctionFactory
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    const auctionFactory = await AuctionFactory.deploy();
    console.log("AuctionFactory deployed to:", auctionFactory.address);

    // Deploy Auction
    // Note: Deploying Auction directly may not be practical, as it should be deployed through AuctionFactory.
    // However, if you want to deploy an individual Auction for testing, you can do so with proper parameters.
    // For now, we'll just show how to deploy an instance.

    // Example of parameters, replace these with your own
    // const owner = deployer.address;
    // const bidIncrement = ethers.utils.parseUnits("0.1", "ether"); // Example increment
    // const startBlock = 10000000; // Example block number
    // const endBlock = startBlock + 1000; // Example end block
    // const revealEndBlock = endBlock + 1000; // Example reveal end block
    // const ipfsHash = "Qm..."; // Example IPFS hash

    // const Auction = await ethers.getContractFactory("Auction");
    // const auction = await Auction.deploy(
    //     startBlock,
    //     endBlock,
    //     revealEndBlock,
    //     ipfsHash
    // );

    // console.log("Auction deployed to:", auction.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
