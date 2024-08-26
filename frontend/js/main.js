// ./js/main.js

// Define contract ABI and address here
const contractABI = [ /* ABI from the compiled contract JSON */ ];
const contractAddress = '/* Contract address */';

// Get elements
const connectWalletBtn = document.getElementById('connect-wallet');
const walletAddressElem = document.getElementById('wallet-address');
const auctionOptionsElem = document.getElementById('auction-options');
const auctionListElem = document.getElementById('auctionList');
const auctionActionsElem = document.getElementById('auction-actions');

// Initialize Web3
let web3;
let accounts;
let contract;

document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletAddressElem = document.getElementById('wallet-address');
    const auctionOptionsElem = document.getElementById('auction-options');
    const auctionListElem = document.getElementById('auctionList');
    const auctionActionsElem = document.getElementById('auction-actions');

    connectWalletBtn.addEventListener('click', connectWallet);

    async function connectWallet() {
        if (window.ethereum) {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];

                // Initialize Web3 instance
                window.web3 = new Web3(window.ethereum);
                const web3 = window.web3;

                // Display the connected wallet address
                walletAddressElem.innerText = `Connected: ${account}`;
                walletAddressElem.style.display = 'block';
                connectWalletBtn.style.display = 'none';

                // Initialize contract
                const contract = new web3.eth.Contract(contractABI, contractAddress);
                auctionOptionsElem.style.display = 'block';
                loadAuctions(contract);
            } catch (error) {
                console.error("User denied account access or error occurred:", error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    }

    async function loadAuctions(contract) {
        // Example: Replace with actual method to get auctions
        const auctions = await contract.methods.getAuctions().call();
        auctionListElem.innerHTML = '<option value="">Select Auction</option>'; // Reset options

        auctions.forEach(auction => {
            const option = document.createElement('option');
            option.value = auction.id;
            option.textContent = `Auction ID: ${auction.id}`;
            auctionListElem.appendChild(option);
        });

        auctionListElem.addEventListener('change', (event) => {
            const auctionId = event.target.value;
            if (auctionId) {
                auctionActionsElem.style.display = 'block';
                setupAuctionActions(auctionId, contract);
            }
        });
    }

    function setupAuctionActions(auctionId, contract) {
        document.getElementById('placeBidBtn').onclick = () => placeBid(auctionId, contract);
        document.getElementById('revealBidBtn').onclick = () => revealBid(auctionId, contract);
        document.getElementById('withdrawBtn').onclick = () => withdraw(auctionId, contract);
        document.getElementById('confirmReceiptBtn').onclick = () => confirmReceipt(auctionId, contract);
    }

    async function placeBid(auctionId, contract) {
        const blindedBid = prompt('Enter your blinded bid (hashed value):');
        const deposit = prompt('Enter your deposit amount in ETH:');
        if (blindedBid && deposit) {
            try {
                await contract.methods.placeBid(auctionId, blindedBid).send({
                    from: accounts[0],
                    value: web3.utils.toWei(deposit, 'ether')
                });
                alert('Bid placed successfully!');
            } catch (error) {
                console.error('Error placing bid:', error);
            }
        }
    }

    async function revealBid(auctionId, contract) {
        const value = prompt('Enter your real bid amount:');
        const secret = prompt('Enter your secret for revealing the bid:');
        if (value && secret) {
            try {
                await contract.methods.revealBid(auctionId, value, secret).send({
                    from: accounts[0]
                });
                alert('Bid revealed successfully!');
            } catch (error) {
                console.error('Error revealing bid:', error);
            }
        }
    }

    async function withdraw(auctionId, contract) {
        try {
            await contract.methods.withdraw(auctionId).send({
                from: accounts[0]
            });
            alert('Withdrawal successful!');
        } catch (error) {
            console.error('Error withdrawing funds:', error);
        }
    }

    async function confirmReceipt(auctionId, contract) {
        try {
            await contract.methods.confirmReceipt(auctionId).send({
                from: accounts[0]
            });
            alert('Receipt confirmed successfully!');
        } catch (error) {
            console.error('Error confirming receipt:', error);
        }
    }
});
