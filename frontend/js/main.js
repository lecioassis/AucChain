const contractAddress = "0xYourContractAddress"; // Replace with your deployed contract address
const contractABI = [ /* Your Contract ABI */ ]; // Replace with your contract ABI

let provider, signer, auctionContract;

async function init() {
    // Connect to Ethereum provider (e.g., MetaMask)
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    // Connect to the contract
    auctionContract = new ethers.Contract(contractAddress, contractABI, signer);
}

async function placeBid() {
    const bidAmount = document.getElementById("bidAmount").value;
    const secret = document.getElementById("secret").value;

    const bidAmountInWei = ethers.utils.parseEther(bidAmount);
    const blindedBid = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["uint256", "string"], [bidAmountInWei, secret])
    );

    // Send the transaction to place the bid
    const tx = await auctionContract.placeBid(blindedBid, { value: bidAmountInWei });
    await tx.wait();
    alert('Bid placed successfully!');
}

async function revealBid() {
    const revealBidAmount = document.getElementById("revealBidAmount").value;
    const revealSecret = document.getElementById("revealSecret").value;

    const revealBidAmountInWei = ethers.utils.parseEther(revealBidAmount);

    // Send the transaction to reveal the bid
    const tx = await auctionContract.revealBid(revealBidAmountInWei, revealSecret);
    await tx.wait();
    alert('Bid revealed successfully!');
}

async function withdraw() {
    const tx = await auctionContract.withdraw();
    await tx.wait();
    alert('Funds withdrawn successfully!');
}

// Initialize the dApp
init();
