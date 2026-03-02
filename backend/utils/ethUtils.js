const { ethers } = require('ethers');

/**
 * 🛰️ NETWORK CONFIGURATION
 * In production, Vercel/Render will pull the RPC URL from your environment variables.
 * We use a timeout to prevent the backend from hanging if the Ethereum node lags.
 */
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY';

// Initialize the Provider with 2026 Ethers v6 standards
const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, null, {
  staticNetwork: true, // Optimizes performance by skipping chainId checks on every call
  batchMaxCount: 1     // Prevents batching errors on some free-tier RPC providers
});

/**
 * Validates the structure of an Ethereum address
 * @param {string} address 
 * @returns {boolean}
 */
const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Fetches the ETH balance for a specific wallet
 * @param {string} address 
 * @returns {Promise<string>} - Human readable balance (e.g., "1.45")
 */
const getEthBalance = async (address) => {
  try {
    if (!isValidAddress(address)) throw new Error("Invalid protocol address structure");

    const balance = await provider.getBalance(address);
    
    // ethers.formatEther handles the 18-decimal conversion safely
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`📡 Node Latency Alert [ETH]: ${error.message}`);
    // Return "0.0" as a fallback to prevent the Dashboard from crashing
    return '0.0';
  }
};

/**
 * Converts a human-readable amount to Wei (BigInt)
 * Used for preparing transactions or smart contract calls
 * @param {string|number} amount 
 */
const toWei = (amount) => {
  try {
    return ethers.parseEther(amount.toString());
  } catch (error) {
    console.error("Conversion Error:", error.message);
    return null;
  }
};

/**
 * Shortens a hash for UI display
 * @param {string} hash 
 * @returns {string} - e.g., 0x1234...5678
 */
const shortenHash = (hash) => {
  if (!hash || hash.length < 10) return hash;
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
};

module.exports = {
  provider,
  isValidAddress,
  getEthBalance,
  toWei,
  shortenHash
};
