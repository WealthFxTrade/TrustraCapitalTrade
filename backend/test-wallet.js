import dotenv from 'dotenv';
import { deriveBtcAddress, getBtcBalance } from './utils/bitcoinUtils.js';
import { getEthBalance, getUsdtBalance } from './utils/ethUtils.js';

dotenv.config();

async function runWalletAudit() {
  console.log("🚀 Starting Trustra Wallet Audit...\n");

  // BTC Check
  const xpub = process.env.BITCOIN_XPUB;
  const btcMaster = process.env.BTC_WALLET_ADDRESS;
  const derived = deriveBtcAddress(xpub, 0);

  console.log("--- ₿ BITCOIN CHECK ---");
  console.log(`✅ Derived Index 0: ${derived}`);
  console.log(derived === btcMaster ? "✅ MATCH" : "⚠️ MISMATCH");
  console.log(`💰 Balance: ${await getBtcBalance(btcMaster)} BTC`);

  // ETH Check
  const ethMaster = process.env.MASTER_ETH_ADDRESS;
  console.log("\n--- 💎 ETHEREUM CHECK ---");
  console.log(`🎯 Target Address: ${ethMaster}`);
  console.log(`💰 ETH Balance: ${await getEthBalance(ethMaster)} ETH`);
  console.log(`💰 USDT Balance: ${await getUsdtBalance(ethMaster)} USDT`);
}

runWalletAudit();

