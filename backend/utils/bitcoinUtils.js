// utils/bitcoinUtils.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);

// ─── Configuration ─────────────────────────────────────────────
const MEMPOOL_MAINNET = 'https://mempool.space/api';
const MEMPOOL_TESTNET = 'https://mempool.space/testnet/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Detect Bitcoin network from XPUB/YPUB/ZPUB prefix
 * @param {string} xpub - Extended public key
 * @returns {bitcoin.Network} bitcoin.networks.bitcoin or testnet
 * @throws {Error} if prefix is invalid or xpub missing
 */
export function detectNetwork(xpub) {
  if (!xpub || typeof xpub !== 'string') {
    throw new Error('XPUB is missing or invalid');
  }

  const prefix = xpub.slice(0, 4);

  // Mainnet
  if (['xpub', 'ypub', 'zpub'].includes(prefix)) {
    return bitcoin.networks.bitcoin;
  }

  // Testnet
  if (['tpub', 'upub', 'vpub'].includes(prefix)) {
    return bitcoin.networks.testnet;
  }

  throw new Error(`Unrecognized XPUB prefix: ${prefix}`);
}

/**
 * Get Mempool.space API base URL based on network
 * @param {string} xpub - Used to detect network
 * @returns {string} API base URL
 */
function getMempoolBase(xpub) {
  const network = detectNetwork(xpub);
  return network === bitcoin.networks.bitcoin ? MEMPOOL_MAINNET : MEMPOOL_TESTNET;
}

/**
 * Derive a SegWit (P2WPKH) receive address from XPUB at path m/84'/0'/0'/0/index
 * @param {string} xpub - Extended public key
 * @param {number} index - Change=0, receive index (0,1,2...)
 * @returns {string} bc1q... address
 * @throws {Error} on invalid input or derivation failure
 */
export function deriveBtcAddress(xpub, index) {
  if (!xpub) throw new Error('XPUB is required');
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Invalid derivation index: ${index} (must be non-negative integer)`);
  }

  try {
    const network = detectNetwork(xpub);
    const node = bip32.fromBase58(xpub, network);

    // BIP84: m/84'/0'/0'/0/index (native SegWit)
    const child = node.derive(84 + network.bip32.hardened).derive(0).derive(0).derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });

    if (!address) throw new Error('Failed to derive address');

    return address;
  } catch (err) {
    throw new Error(`Address derivation failed: ${err.message}`);
  }
}

/**
 * Get BTC balance for an address (chain_stats only)
 * @param {string} address - Bitcoin address
 * @param {string} [xpub] - Optional XPUB for network detection (defaults to mainnet)
 * @returns {number} Balance in BTC
 */
export async function getBtcBalance(address, xpub = null) {
  if (!address || typeof address !== 'string') return 0;

  try {
    const base = xpub ? getMempoolBase(xpub) : MEMPOOL_MAINNET;
    const res = await axios.get(`\( {base}/address/ \){address}`, { timeout: DEFAULT_TIMEOUT });

    const { funded_txo_sum, spent_txo_sum } = res.data.chain_stats;
    const balanceSats = funded_txo_sum - spent_txo_sum;
    return balanceSats / 1e8; // BTC
  } catch (err) {
    console.warn(`Balance fetch failed for ${address}:`, err.message);
    return 0;
  }
}

/**
 * Get number of confirmations for a transaction
 * @param {string} txid - Transaction ID
 * @param {string} [xpub] - Optional XPUB for network detection
 * @returns {number} Confirmations (0 if unconfirmed or not found)
 */
export async function getBtcTxConfirmations(txid, xpub = null) {
  if (!txid || typeof txid !== 'string') return 0;

  try {
    const base = xpub ? getMempoolBase(xpub) : MEMPOOL_MAINNET;

    const [txRes, tipRes] = await Promise.all([
      axios.get(`\( {base}/tx/ \){txid}`, { timeout: DEFAULT_TIMEOUT }),
      axios.get(`${base}/blocks/tip/height`, { timeout: DEFAULT_TIMEOUT }),
    ]);

    if (!txRes.data?.status?.confirmed) return 0;

    const currentHeight = tipRes.data;
    const txHeight = txRes.data.status.block_height;
    return currentHeight - txHeight + 1;
  } catch (err) {
    console.warn(`Confirmation check failed for tx ${txid}:`, err.message);
    return 0;
  }
}

// ─── Aliases for backward compatibility ────────────────────────────
export const deriveAddressFromXpub = deriveBtcAddress;
export const generateBitcoinAddress = deriveBtcAddress;
