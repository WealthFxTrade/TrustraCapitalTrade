// backend/utils/bitcoinUtils.js  ← REPLACE ENTIRE FILE WITH THIS
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const MEMPOOL_MAINNET = 'https://mempool.space/api';
const NETWORK = bitcoin.networks.bitcoin;

export function deriveBtcAddress(index = 0) {
  const xpub = process.env.BITCOIN_XPUB;
  if (!xpub) throw new Error('BITCOIN_XPUB is required in .env');

  try {
    const node = bip32.fromBase58(xpub, NETWORK);
    // Correct BIP84 derivation: m/84'/0'/0'/0/index
    const child = node.derive(0).derive(0).derive(index);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK
    });

    return { address, index };
  } catch (err) {
    console.error('[BTC DERIVE ERROR]', err);
    throw new Error(`Address derivation failed: ${err.message}`);
  }
}

export async function getBtcBalance(address) {
  if (!address) return 0;
  try {
    const res = await axios.get(`\( {MEMPOOL_MAINNET}/address/ \){address}`);
    const { chain_stats, mempool_stats } = res.data;

    const confirmed = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
    const mempool = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;

    return (confirmed + mempool) / 100_000_000;
  } catch (err) {
    console.error(`[Balance Error] ${address}`, err.message);
    return 0;
  }
}

export function getHotWalletAddress() {
  return deriveBtcAddress(0).address;
}
