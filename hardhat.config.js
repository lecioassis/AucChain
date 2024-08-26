// hardhat.config.js

require('@nomiclabs/hardhat-ethers');

module.exports = {
    solidity: "0.8.19",
    networks: {
        ganache: {
            url: "http://127.0.0.1:7545", // URL for Ganache
            accounts: ['0x548cec8c69bc96a4a632eb2aaa78b9591fefcf59060f532c72d618eedde92a0c'] // Replace YOUR_PRIVATE_KEY with your Ganache account's private key
        }
    }
};
