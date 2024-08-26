// hardhat.config.js

require('@nomiclabs/hardhat-ethers');

module.exports = {
    solidity: "0.8.19",
    networks: {
        ganache: {
            url: "http://127.0.0.1:7545", // URL for Ganache
            accounts: ['0x10c0b00679d29bbae4721ba63f7e92a3aff452fde6e92e2e91a9c1a50693cb05'] // Replace YOUR_PRIVATE_KEY with your Ganache account's private key
        }
    }
};
