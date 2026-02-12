import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Initialize provider with the URL from your .env
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL, undefined, {
  staticNetwork: new ethers.Network("mainnet", 1)
});

export const getEthBalance = async (address) => {
  try {
    const balanceWei = await provider.getBalance(address);
    return parseFloat(ethers.formatEther(balanceWei));
  } catch (error) {
    throw new Error(`[ETH_SYNC_ERROR] ${address}: ${error.message}`);
  }
};

export const getUsdtBalance = async (address) => {
  try {
    const usdtAddress = process.env.USDT_CONTRACT_ADDRESS || "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const abi = ["function balanceOf(address owner) view returns (uint256)"];
    const contract = new ethers.Contract(usdtAddress, abi, provider);
    const balanceRaw = await contract.balanceOf(address);
    return Number(balanceRaw) / 1000000;
  } catch (error) {
    throw new Error(`[USDT_SYNC_ERROR] ${address}: ${error.message}`);
  }
};

