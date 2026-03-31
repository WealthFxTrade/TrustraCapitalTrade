// backend/utils/bitcoinUtils.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const MEMPOOL_API = 'https://mempool.space/api';
const NETWORK = bitcoin.networks.bitcoin;

/**
 * 🔑 DERIVATION ENGINE
 * Generates a unique Native SegWit (bc1...) address for a user.
 */
export function deriveBtcAddress(index = 0) {
  // ALIGNMENT: Changed BITCOIN_XPUB to BTC_XPUB to match your .env file
  const xpub = process.env.BTC_XPUB;

  if (!xpub) {
    throw new Error('BTC_XPUB is missing from environment protocols');
  }

  try {
    const node = bip32.fromBase58(xpub, NETWORK);
    
    // Standard derivation for external receiving addresses
    const child = node.derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK
    });

    return { address, index };
  } catch (err) {
    console.error('[BTC DERIVE CRITICAL ERROR]', err);
    throw new Error(`Address derivation failed: ${err.message}`);
  }
}

/**
 * 🛰️ BLOCKCHAIN SYNC
 * Fetches the balance of an address (Confirmed + Unconfirmed)
 */
export async function getBtcBalance(address) {
  if (!address) return 0;

  try {
    // Fixed the axios URL string interpolation
    const res = await axios.get(`${MEMPOOL_API}/address/${address}`);
    const { chain_stats, mempool_stats } = res.data;

    // Sum of all received minus all spent (including mempool for speed)
    const confirmed = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
    const mempool = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;

    return (confirmed + mempool) / 100000000;
  } catch (err) {
    console.error(`[BLOCKCHAIN SYNC ERROR] Address: ${address} | ${err.message}`);
    return 0;
  }
}

/**
 * 🏦 MASTER VAULT ACCESS
 */
export function getHotWalletAddress() {
  try {
    const { address } = deriveBtcAddress(0);
    return address;
  } catch (err) {
    return process.env.BTC_WALLET_ADDRESS;
  }
}

