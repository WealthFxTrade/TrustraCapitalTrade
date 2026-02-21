import { ethers } from "ethers";

/**
 * 🚨 EMERGENCY EVACUATION SCRIPT
 * Source: Compromised Mnemonic (from your logs)
 * Destination: 0x9830440e9257f33afc29c8e3f35a7681920379d4
 */

const COMPROMISED_MNEMONIC = "grunt bar same rent century black weapon blossom inquiry reject shaft stomach";
const SAFE_DESTINATION = "0x9830440e9257f33afc29c8e3f35a7681920379d4";
const RPC_URL = "https://eth.drpc.org";
const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = ethers.Wallet.fromPhrase(COMPROMISED_MNEMONIC, provider);

async function performRescue() {
    console.log(`🛡️  Evacuating funds from: ${wallet.address}`);
    console.log(`🎯 Target safe address: ${SAFE_DESTINATION}`);

    // 1. Move USDT (erc20)
    try {
        const usdtAbi = ["function balanceOf(address) view returns (uint256)", "function transfer(address, uint256) returns (bool)"];
        const contract = new ethers.Contract(USDT_CONTRACT, usdtAbi, wallet);
        const usdtBalance = await contract.balanceOf(wallet.address);

        if (usdtBalance > 0n) {
            console.log(`💎 Found ${ethers.formatUnits(usdtBalance, 6)} USDT. Sending...`);
            const tx = await contract.transfer(SAFE_DESTINATION, usdtBalance);
            console.log(`✅ USDT Tx: https://etherscan.io{tx.hash}`);
            await tx.wait();
        } else {
            console.log("ℹ️  No USDT found in this wallet.");
        }
    } catch (e) { console.error("❌ USDT Transfer Failed:", e.message); }

    // 2. Move ETH (entire balance minus gas)
    try {
        const balance = await provider.getBalance(wallet.address);
        const feeData = await provider.getFeeData();
        
        // Use a slightly higher gas price for speed (Bumping by 30%)
        const gasPrice = (feeData.gasPrice * 130n) / 100n;
        const gasLimit = 21000n;
        const totalCost = gasPrice * gasLimit;

        if (balance > totalCost) {
            const amountToSend = balance - totalCost;
            console.log(`💰 Moving ${ethers.formatEther(amountToSend)} ETH...`);
            
            const tx = await wallet.sendTransaction({
                to: SAFE_DESTINATION,
                value: amountToSend,
                gasLimit,
                gasPrice
            });
            
            console.log(`✅ ETH Tx: https://etherscan.io{tx.hash}`);
            await tx.wait();
            console.log("🎉 EVACUATION COMPLETE.");
        } else {
            console.log("⚠️  Insufficient ETH for gas.");
        }
    } catch (e) { console.error("❌ ETH Transfer Failed:", e.message); }
}

performRescue();

