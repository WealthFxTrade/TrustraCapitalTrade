const { ethers } = require("ethers");

// 1. CONFIGURATION
const MNEMONIC = "grunt bar same rent century black weapon blossom inquiry reject shaft stomach";
const SAFE_DESTINATION = "0x9830440e9257f33afc29c8e3f35a7681920379d4"; 
const RPC_URL = "https://eth.drpc.org";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

async function rescue() {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        // 2. DERIVE THE SPECIFIC WALLET (BIP44 Path)
        // Standard path m/44'/60'/0'/0/0 leads to 0xE407...
        const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC, "", "m/44'/60'/0'/0/0").connect(provider);
        
        console.log(`🛡️  Targeting Wallet: ${wallet.address}`);
        if (wallet.address.toLowerCase() !== "0xe40707f5297d7e5f272b4be0410943ea7b7793a5") {
            throw new Error("Address mismatch! Check mnemonic or derivation path.");
        }

        // 3. CHECK USDT BALANCE
        const usdtContract = new ethers.Contract(USDT_ADDRESS, [
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) public returns (bool)"
        ], wallet);

        const usdtBalance = await usdtContract.balanceOf(wallet.address);
        console.log(`💰 USDT Balance: ${ethers.formatUnits(usdtBalance, 6)}`);

        if (usdtBalance > 0n) {
            console.log("🚀 Transferring USDT...");
            const usdtTx = await usdtContract.transfer(SAFE_DESTINATION, usdtBalance);
            console.log(`✅ USDT Sent: ${usdtTx.hash}`);
            await usdtTx.wait();
        }

        // 4. SWEEP ETH BALANCE (minus gas)
        const ethBalance = await provider.getBalance(wallet.address);
        const feeData = await provider.getFeeData();
        const gasLimit = 21000n;
        const totalGasCost = feeData.gasPrice * gasLimit;

        if (ethBalance > totalGasCost) {
            console.log(`💎 Sweeping ${ethers.formatEther(ethBalance - totalGasCost)} ETH...`);
            const ethTx = await wallet.sendTransaction({
                to: SAFE_DESTINATION,
                value: ethBalance - totalGasCost,
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice
            });
            console.log(`✅ ETH Swept: ${ethTx.hash}`);
        } else {
            console.log("⚠️  Insufficient ETH for gas.");
        }

    } catch (error) {
        console.error("❌ Execution Error:", error.message);
    }
}

rescue();

