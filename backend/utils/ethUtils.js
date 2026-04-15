// utils/ethUtils.js
import { ethers } from 'ethers';

const RPC_URLS = [
  process.env.ETH_RPC_URL,
  process.env.ETH_FALLBACK_RPC,
  process.env.ETH_FALLBACK2,
  process.env.ETH_FALLBACK3,
  process.env.ETH_FALLBACK4,
  process.env.ETH_FALLBACK5,
].filter(url => typeof url === 'string' && url.trim() !== '');

let currentProvider = null;

/**
 * Get working Ethereum provider with multiple fallbacks
 */
const getProvider = async () => {
  if (currentProvider) return currentProvider;

  if (RPC_URLS.length === 0) {
    console.error('❌ No RPC URLs configured in .env!');
    throw new Error('No Ethereum RPC configured');
  }

  console.log(`🔄 [ETH PROVIDER] Trying ${RPC_URLS.length} RPC endpoints...`);

  for (const url of RPC_URLS) {
    try {
      const prov = new ethers.JsonRpcProvider(url);

      const network = await Promise.race([
        prov.getNetwork(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]);

      console.log(`✅ [ETH PROVIDER] Connected successfully to: \( {url} (Chain ID: \){network.chainId})`);
      currentProvider = prov;
      return prov;
    } catch (err) {
      console.warn(`⚠️ RPC failed (\( {url}): \){err.message}`);
    }
  }

  console.error('❌ All Ethereum RPC endpoints failed. Using zero-balance mode.');
  return {
    getBalance: async () => ethers.getBigInt(0),
    getNetwork: async () => ({ chainId: 1 })
  };
};

const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'];

/**
 * Get native ETH balance
 */
export const getEthBalance = async (address) => {
  try {
    if (!ethers.isAddress(address)) throw new Error('Invalid Ethereum address');

    const provider = await getProvider();
    const balanceWei = await provider.getBalance(address);
    return ethers.formatEther(balanceWei);
  } catch (error) {
    console.error(`[ETH BALANCE ERROR] ${address}:`, error.message);
    return '0';
  }
};

/**
 * Get USDT balance
 */
export const getUsdtBalance = async (address) => {
  try {
    if (!ethers.isAddress(address)) throw new Error('Invalid Ethereum address');

    const provider = await getProvider();
    const contract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);

    const rawBalance = await contract.balanceOf(address);
    return ethers.formatUnits(rawBalance, 6);
  } catch (error) {
    console.warn(`⚠️ [USDT BALANCE WARN] \( {address}: \){error.message}`);
    return '0';
  }
};

/**
 * Derive ETH address from index
 */
export const deriveEthAddress = (index) => {
  if (typeof index !== 'number' || index < 0) {
    throw new Error('Invalid address_index');
  }
  const dummy = `0x${(index + 0x75bcd15).toString(16).padStart(40, '0')}`;
  return { address: dummy, path: `m/44'/60'/0'/0/${index}` };
};
