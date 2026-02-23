import { ethers } from 'ethers';
import User from '../models/User.js';

// Configuration - USDT Mainnet Contract provided by user
const RPC_URL = process.env.ETH_RPC_URL;
const USDT_CONTRACT_ADDRESS = "0x9830440e9257f33afc29c8e3f35a7681920379d4";
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

/**
 * Scans Ethereum nodes for ETH and USDT deposits using the specific 0x983... contract.
 */
export async function checkEthDeposits() {
  try {
    if (!RPC_URL) throw new Error("ETH_RPC_URL missing in environment");
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);

    // Fetch users with ETH/USDT addresses generated via walletService
    const users = await User.find({ "depositAddresses.ETH": { $exists: true } });
    
    console.log(`[NODE_SCAN] Monitoring ${users.length} deployment points on 0x9830...`);

    for (const user of users) {
      const address = user.depositAddresses.get('ETH');

      try {
        // 1. Sync Native ETH
        const rawEthBalance = await provider.getBalance(address);
        const onChainEth = parseFloat(ethers.formatEther(rawEthBalance));
        const dbEth = user.balances.get('ETH') || 0;

        if (onChainEth > dbEth) {
          await syncAsset(user, 'ETH', onChainEth, dbEth, address);
        }

        // 2. Sync USDT (Standard 6-decimal units)
        const rawUsdtBalance = await usdtContract.balanceOf(address);
        const onChainUsdt = parseFloat(ethers.formatUnits(rawUsdtBalance, 6)); 
        const dbUsdt = user.balances.get('USDT') || 0;

        if (onChainUsdt > dbUsdt) {
          await syncAsset(user, 'USDT', onChainUsdt, dbUsdt, address);
        }

      } catch (err) {
        console.error(`[SYNC_ERROR] Node: ${address.slice(0,8)}... | Msg: ${err.message}`);
      }
    }
  } catch (globalErr) {
    console.error(`[CRITICAL_WATCHER_FAILURE]`, globalErr.message);
  }
}

/**
 * Atomic balance & ledger sync
 */
async function syncAsset(user, asset, onChain, db, address) {
  const difference = onChain - db;
  
  user.balances.set(asset, onChain);
  user.ledger.push({
    amount: difference,
    currency: asset,
    type: 'deposit',
    status: 'completed',
    description: `Automated ${asset} Node Sync | 0x${address.slice(2, 8)}...`,
    createdAt: new Date()
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();
  
  console.log(`[DEPOSIT_CONFIRMED] ${asset}: +${difference} for ${user.email}`);
}

/**
 * Background Daemon Initialization
 */
export const startEthDaemon = (minutes = 15) => {
  setInterval(checkEthDeposits, minutes * 60 * 1000);
  console.log(`[SYSTEM] ETH/USDT Watcher Live | Contract: 0x9830...`);
};

