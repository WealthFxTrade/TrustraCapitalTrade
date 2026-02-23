import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const USDT_ABI = ["function balanceOf(address) view returns (uint256)"];

export const getEthBalance = async (address) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    throw new Error("ETH Balance Fetch Failed");
  }
};

export const getUsdtBalance = async (address) => {
  try {
    const contract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 6);
  } catch (error) {
    return "0.00";
  }
};

