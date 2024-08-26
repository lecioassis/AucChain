let web3;
let account;
let auctionFactoryContract;
let auctionContract;

const factoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const auctionFactoryAbiPath = '../artifacts/contracts/AuctionFactory.sol/AuctionFactory.json';
const auctionAbiPath = '../artifacts/contracts/Auction.sol/Auction.json';

document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connect-wallet');
    const walletAddressDisplay = document.getElementById('wallet-address');
    const auctionControls = document.getElementById('auction-controls');
    const auctionList = document.getElementById('auction-list');
    const auctionInteraction = document.getElementById('auction-interaction');

    web3 = new Web3(window.ethereum);

    fetch(auctionFactoryAbiPath)
        .then(response => response.json())
        .then(data => {
            const abi = data.abi;
            auctionFactoryContract = new web3.eth.Contract(abi, factoryContractAddress);
            console.log(auctionFactoryContract); // You can now interact with the contract
        })
        
        .catch(error => console.error('Error loading the ABI:', error));

    connectButton.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                account = accounts[0];
                walletAddressDisplay.innerText = `Connected: ${account}`;
                // Show controls after connection
                auctionControls.style.display = 'block';
                auctionList.style.display = 'block';
                loadAuctions();
            } catch (error) {
                console.error("User denied account access or error occurred:", error);
            }
        } else {
            alert("MetaMask is not installed. Please install MetaMask and try again.");
        }
    });

    async function loadAuctions() {
        try {
            // Fetch all auction addresses
            const auctionAddresses = await auctionFactoryContract.methods.auctions().call();
            console.log(auctionAddresses);
    
            // Get the dropdown element
            const auctionSelect = document.getElementById('auction-select');
            auctionSelect.innerHTML = ""; // Clear the dropdown
    
            // Loop through each auction address
            for (let i = 0; i < auctionAddresses.length; i++) {
                const auctionAddress = auctionAddresses[i];
    
                // Directly append auction addresses to the dropdown
                const option = document.createElement('option');
                option.value = auctionAddress;
                option.text = `Auction ${i + 1}: ${auctionAddress}`;
                auctionSelect.appendChild(option);
            }
        } catch (error) {
            console.error("Error loading auctions:", error);
        }
    }
    

    document.getElementById('create-auction').addEventListener('click', async () => {
        const ipfsHash = document.getElementById('ipfs-hash').value;
        const startBlock = document.getElementById('start-block').value;
        const endBlock = document.getElementById('end-block').value;
        const revealEndBlock = document.getElementById('reveal-end-block').value;

        try {
            await auctionFactoryContract.methods.createAuction(ipfsHash, startBlock, endBlock, revealEndBlock)
                .send({ from: account });
            alert("Auction created successfully!");
            loadAuctions(); // Refresh auction list
        } catch (error) {
            console.error("Error creating auction:", error);
        }
    });

    document.getElementById('interact-auction').addEventListener('click', async () => {
        const auctionSelect = document.getElementById('auction-select');
        const selectedAuctionAddress = auctionSelect.value;

        if (selectedAuctionAddress) {
            auctionInteraction.style.display = 'block';
            displayAuctionDetails(selectedAuctionAddress);
        }
    });

    async function displayAuctionDetails(auctionAddress) {
        const auctionContract = new web3.eth.Contract(auctionABI, auctionAddress);
        const details = await auctionContract.methods.getAuctionDetails().call();
        const auctionDetailsDiv = document.getElementById('auction-details');
        auctionDetailsDiv.innerHTML = `IPFS Hash: ${details.ipfsHash}, Highest Bid: ${details.highestBindingBid}`;
    }

    document.getElementById('place-bid').addEventListener('click', async () => {
        const blindedBid = document.getElementById('blinded-bid').value;
        const selectedAuctionAddress = document.getElementById('auction-select').value;
        const auctionContract = new web3.eth.Contract(auctionABI, selectedAuctionAddress);

        try {
            await auctionContract.methods.placeBid(blindedBid)
                .send({ from: account, value: web3.utils.toWei(blindedBid, 'ether') });
            alert("Bid placed successfully!");
        } catch (error) {
            console.error("Error placing bid:", error);
        }
    });

    document.getElementById('reveal-bid').addEventListener('click', async () => {
        const revealValue = document.getElementById('reveal-value').value;
        const secret = document.getElementById('secret').value;
        const selectedAuctionAddress = document.getElementById('auction-select').value;
        const auctionContract = new web3.eth.Contract(auctionABI, selectedAuctionAddress);

        try {
            await auctionContract.methods.revealBid(revealValue, secret)
                .send({ from: account });
            alert("Bid revealed successfully!");
        } catch (error) {
            console.error("Error revealing bid:", error);
        }
    });

    document.getElementById('withdraw').addEventListener('click', async () => {
        const selectedAuctionAddress = document.getElementById('auction-select').value;
        const auctionContract = new web3.eth.Contract(auctionABI, selectedAuctionAddress);

        try {
            await auctionContract.methods.withdraw()
                .send({ from: account });
            alert("Funds withdrawn successfully!");
        } catch (error) {
            console.error("Error withdrawing funds:", error);
        }
    });

    document.getElementById('confirm-item').addEventListener('click', async () => {
        const selectedAuctionAddress = document.getElementById('auction-select').value;
        const auctionContract = new web3.eth.Contract(auctionABI, selectedAuctionAddress);

        try {
            await auctionContract.methods.confirmReceipt()
                .send({ from: account });
            alert("Item receipt confirmed!");
        } catch (error) {
            console.error("Error confirming item receipt:", error);
        }
    });
});
