import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

// ⚡ REQUIRED: Initialize BIP32 with the Elliptic Curve library for Bitcoin v7+
const bip32 = BIP32Factory(ecc);

// FIX: Added /api prefix and corrected Testnet endpoint
const MEMPOOL_MAINNET = 'https://mempool.space';
const MEMPOOL_TESTNET = 'https://mempool.space';
const DEFAULT_TIMEOUT = 10000;

/**
 * 🔍 Network Detector
 * Identifies if the XPUB belongs to Bitcoin Mainnet or Testnet
 */
export function detectNetwork(xpub) {
  if (!xpub || typeof xpub !== 'string') throw new Error('XPUB missing or invalid');
  const prefix = xpub.slice(0, 4);

  // Mainnet: xpub, ypub, zpub
  if (['xpub', 'ypub', 'zpub'].includes(prefix)) {
    return bitcoin.networks.bitcoin;
  }
  // Testnet: tpub, upub, vpub
  if (['tpub', 'upub', 'vpub'].includes(prefix)) {
    return bitcoin.networks.testnet;
  }

  throw new Error(`Unrecognized XPUB prefix: ${prefix}`);
}

/**
 * 🌐 API Base Selector
 */
function getMempoolBase(xpub) {
  try {
    const network = detectNetwork(xpub);
    return network === bitcoin.networks.bitcoin ? MEMPOOL_MAINNET : MEMPOOL_TESTNET;
  } catch (error) {
    return MEMPOOL_MAINNET; // Default to Mainnet if detection fails
  }
}

/**
 * 🔑 Address Derivator
 * Derives Native SegWit (bc1q) addresses: m/0/index
 */
export function deriveBtcAddress(xpub, index) {
  if (!xpub) throw new Error('XPUB is required for derivation');
  try {
    const network = detectNetwork(xpub);
    const node = bip32.fromBase58(xpub, network);
    
    // Standard derivation path for receiving addresses: m/0/index
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });

    if (!address) throw new Error('Derivation returned null address');
    return address;
  } catch (err) {
    throw new Error(`Trustra Node Derivation Error: ${err.message}`);
  }
}

/**
 * 💰 Balance Checker
 * Fetches on-chain data from Mempool.space
 */
export async function getBtcBalance(address, xpub = null) {
  if (!address) return 0;
  try {
    // Select base URL based on provided xpub or default to Mainnet
    const base = xpub ? getMempoolBase(xpub) : MEMPOOL_MAINNET;
    
    // FIX: Using the /address/:address endpoint on the API
    const res = await axios.get(`${base}/address/${address}`, { 
      timeout: DEFAULT_TIMEOUT,
      headers: { 'Accept': 'application/json' }
    });

    if (!res.data || !res.data.chain_stats) {
      return 0;
    }

    // confirmed_balance = (total_received - total_spent) / satoshi_unit
    const { funded_txo_sum, spent_txo_sum } = res.data.chain_stats;
    const confirmedBalance = (funded_txo_sum - spent_txo_sum) / 100000000;

    // Optional: Add mempool (pending) balance if needed
    const { funded_txo_sum: p_funded, spent_txo_sum: p_spent } = res.data.mempool_stats;
    const pendingBalance = (p_funded - p_spent) / 100000000;

    return confirmedBalance + pendingBalance;
  } catch (err) {
    // Detailed error logging to help debug getaddrinfo ENOTFOUND issues
    console.error(`⚠️ [BTC UTILS] Fetch Error for ${address}:`, err.message);
    return 0;
  }
}

export const generateBitcoinAddress = deriveBtcAddress;

