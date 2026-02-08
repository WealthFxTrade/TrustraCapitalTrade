import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import dotenv from 'dotenv';

dotenv.config();

// Initialize BIP32 with the elliptic curve library for Node v25 compatibility
const bip32 = BIP32Factory(ecc);
const NETWORK = bitcoin.networks.bitcoin; 
const BTC_XPUB = process.env.BITCOIN_XPUB;

/**
 * Derive Native Segwit (P2WPKH) address from XPUB and index
 */
export const deriveBtcAddress = (index) => {
  if (!BTC_XPUB) throw new Error('BITCOIN_XPUB not set in env');
  const node = bip32.fromBase58(BTC_XPUB, NETWORK);
  const child = node.derive(0).derive(index);
  const { address } = bitcoin.payments.p2wpkh({ 
    pubkey: child.publicKey, 
    network: NETWORK 
  });
  return address;
};

/**
 * Fetch BTC balance from Blockchain.info API
 */
export const getBtcBalance = async (address) => {
  try {
    const response = await fetch(`https://blockchain.info{address}`);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.final_balance / 100000000;
  } catch (error) {
    console.error(`Balance fetch failed for ${address}:`, error.message);
    return 0;
  }
};

/**
 * Get confirmations for a transaction ID
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    const response = await fetch(`https://blockchain.info{txid}`);
    if (!response.ok) return 0;
    const data = await response.json();
    
    if (!data.block_height) return 0;

    const latestRes = await fetch('https://blockchain.info');
    const latestData = await latestRes.json();
    
    return latestData.height - data.block_height + 1;
  } catch (error) {
    return 0;
  }
};

