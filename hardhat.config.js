// hardhat.config.js

require('@nomiclabs/hardhat-ethers');

module.exports = {
    solidity: "0.8.19",
    networks: {
        ganache: {
            url: "http://127.0.0.1:7545", // URL for Ganache
            accounts: ['0x4b5b46ad846326447a13c873eab78d30dddd5968b7de5d48acfd7fda0b7d18ee'] // Replace YOUR_PRIVATE_KEY with your Ganache account's private key
        }
    }
};
