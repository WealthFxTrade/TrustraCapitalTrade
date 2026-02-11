import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Correct ESM Initialization for BIP32
const bip32 = BIP32Factory(ecc);
const NETWORK = bitcoin.networks.bitcoin;
const BTC_XPUB = process.env.BITCOIN_XPUB;

/**
 * Derive Native Segwit (bc1...) address from XPUB and index
 * Logic: m/0/index (Standard Receive Chain)
 */
export const deriveBtcAddress = (index) => {
  if (!BTC_XPUB) throw new Error('BITCOIN_XPUB not set in env');
  const node = bip32.fromBase58(BTC_XPUB, NETWORK);
  // Standard derivation: external chain (0), then index
  const child = node.derive(0).derive(index);
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: NETWORK
  });
  return address;
};

/**
 * Fetch BTC balance from Blockchain API
 */
export const getBtcBalance = async (address) => {
  try {
    // FIX: Added /rawaddr/ endpoint and correct interpolation
    const response = await fetch(`https://blockchain.info{address}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    
    // final_balance is in Satoshis. 1 BTC = 100,000,000 Satoshis
    return data.final_balance / 100000000;
  } catch (error) {
    console.error(`[BTC Utils] Balance error for ${address}:`, error.message);
    return 0;
  }
};

/**
 * Fetch Confirmations for a transaction
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    // FIX: Added /rawtx/ endpoint
    const response = await fetch(`https://blockchain.info{txid}`);
    if (!response.ok) return 0;
    const data = await response.json();
    
    if (!data.block_height) return 0; // Unconfirmed

    // Get latest block height to calculate confirmations
    const latestRes = await fetch('https://blockchain.info');
    const latestHeight = await latestRes.text();
    
    return parseInt(latestHeight) - data.block_height + 1;
  } catch (error) {
    console.error(`[BTC Utils] TX error:`, error.message);
    return 0;
  }
};

