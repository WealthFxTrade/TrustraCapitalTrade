import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const MEMPOOL_API = 'https://mempool.space/api';
const NETWORK = bitcoin.networks.bitcoin;

/**
 * 🔑 DERIVATION ENGINE
 * Generates a unique Native SegWit (bc1...) address for a user from xpub
 */
export function deriveBtcAddress(index = 0) {
  if (!process.env.BTC_XPUB) throw new Error('BTC_XPUB is missing');

  try {
    const node = bip32.fromBase58(process.env.BTC_XPUB, NETWORK);
    const child = node.derive(0).derive(index);
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK
    });
    return { address };
  } catch (err) {
    console.error('[BTC DERIVE ERROR]', err);
    throw new Error(`Address derivation failed: ${err.message}`);
  }
}

/**
 * Get balance of a BTC address (confirmed + unconfirmed)
 */
export async function getBtcBalance(address) {
  if (!address) return 0;
  try {
    const res = await axios.get(`${MEMPOOL_API}/address/${address}`);
    const { chain_stats, mempool_stats } = res.data;
    const confirmed = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
    const mempool = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
    return (confirmed + mempool) / 100000000;
  } catch (err) {
    console.error(`[BLOCKCHAIN SYNC ERROR] Address: ${address} | ${err.message}`);
    return 0;
  }
}

/**
 * Get platform hot wallet address
 */
export function getHotWalletAddress() {
  try {
    return deriveBtcAddress(0).address;
  } catch {
    return process.env.BTC_WALLET_ADDRESS;
  }
}
