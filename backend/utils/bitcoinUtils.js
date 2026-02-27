// utils/bitcoinUtils.js - Optimized for Trustra v8.4.1
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

// Initialize BIP32 with the Elliptic Curve library
const bip32 = BIP32Factory(ecc);

const MEMPOOL_MAINNET = 'https://mempool.space/api';
const MEMPOOL_TESTNET = 'https://mempool.space/testnet/api';
const DEFAULT_TIMEOUT = 10000;

export function detectNetwork(xpub) {
  if (!xpub || typeof xpub !== 'string') throw new Error('XPUB missing');
  const prefix = xpub.slice(0, 4);
  
  if (['xpub', 'ypub', 'zpub'].includes(prefix)) return bitcoin.networks.bitcoin;
  if (['tpub', 'upub', 'vpub'].includes(prefix)) return bitcoin.networks.testnet;
  
  throw new Error(`Unrecognized XPUB prefix: ${prefix}`);
}

function getMempoolBase(xpub) {
  return detectNetwork(xpub) === bitcoin.networks.bitcoin ? MEMPOOL_MAINNET : MEMPOOL_TESTNET;
}

/**
 * Derive SegWit (bc1q) address
 * Path: m/0/index (Standard for most HD wallet software xpubs)
 */
export function deriveBtcAddress(xpub, index) {
  if (!xpub) throw new Error('XPUB is required for derivation');
  
  try {
    const network = detectNetwork(xpub);
    const node = bip32.fromBase58(xpub, network);

    // Standard derivation: m/0/index
    // Note: If using a raw BIP84 zpub, the child path is usually 0/index
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

export async function getBtcBalance(address, xpub = null) {
  if (!address) return 0;
  try {
    const base = xpub ? getMempoolBase(xpub) : MEMPOOL_MAINNET;
    const res = await axios.get(`${base}/address/${address}`, { timeout: DEFAULT_TIMEOUT });
    
    const { funded_txo_sum, spent_txo_sum } = res.data.chain_stats;
    return (funded_txo_sum - spent_txo_sum) / 1e8;
  } catch (err) {
    return 0;
  }
}

export async function getBtcTxConfirmations(txid, xpub = null) {
  if (!txid) return 0;
  try {
    const base = xpub ? getMempoolBase(xpub) : MEMPOOL_MAINNET;
    const [txRes, tipRes] = await Promise.all([
      axios.get(`${base}/tx/${txid}`, { timeout: DEFAULT_TIMEOUT }),
      axios.get(`${base}/blocks/tip/height`, { timeout: DEFAULT_TIMEOUT }),
    ]);

    if (!txRes.data?.status?.confirmed) return 0;
    return tipRes.data - txRes.data.status.block_height + 1;
  } catch (err) {
    return 0;
  }
}

export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;

