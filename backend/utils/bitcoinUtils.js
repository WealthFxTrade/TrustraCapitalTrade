import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import dotenv from 'dotenv';

dotenv.config();

// Initialize BIP32 with ECC
const bip32 = BIP32Factory(ecc);
const NETWORK = bitcoin.networks.bitcoin;
const BTC_XPUB = process.env.BITCOIN_XPUB;

if (!BTC_XPUB) throw new Error('BITCOIN_XPUB not set in environment variables');

/**
 * Derive Native SegWit (bech32, bc1...) address from XPUB and index
 * Path: m/0/index (external chain)
 */
export const deriveAddressFromXpub = (xpub, index) => {
  const node = bip32.fromBase58(xpub, NETWORK);
  const child = node.derive(0).derive(index);
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: NETWORK
  });
  return address;
};

// ✅ Alias for backward compatibility
export const deriveBtcAddress = deriveAddressFromXpub;

/**
 * Get BTC balance from Blockchain.info API
 */
export const getBtcBalance = async (address) => {
  try {
    const response = await fetch(`https://blockchain.info/rawaddr/${address}?cors=true`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return (data.final_balance / 1e8); // Convert Satoshis to BTC
  } catch (error) {
    console.error(`[BTC Utils] Balance error for ${address}:`, error.message);
    return 0;
  }
};

/**
 * Get confirmations of a BTC transaction
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    const response = await fetch(`https://blockchain.info/rawtx/${txid}?cors=true`);
    if (!response.ok) return 0;
    const data = await response.json();
    if (!data.block_height) return 0; // Unconfirmed

    const latestRes = await fetch('https://blockchain.info/q/getblockcount?cors=true');
    if (!latestRes.ok) return 0;
    const latestHeight = await latestRes.text();

    return parseInt(latestHeight) - data.block_height + 1;
  } catch (error) {
    console.error(`[BTC Utils] TX error for ${txid}:`, error.message);
    return 0;
  }
};
