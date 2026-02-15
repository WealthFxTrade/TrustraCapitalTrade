import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import b58 from 'bs58check';
import dotenv from 'dotenv';

dotenv.config();

const bip32 = BIP32Factory(ecc);
const NETWORK = bitcoin.networks.bitcoin;

/**
 * 🛠️ INTERNAL: Convert Zpub/Ypub to Xpub
 * Ensures compatibility with modern SegWit keys (zpub).
 */
const convertToXpub = (zpub) => {
  if (!zpub || (!zpub.startsWith('zpub') && !zpub.startsWith('ypub'))) return zpub;
  
  let data = b58.decode(zpub);
  data.set([0x04, 0x88, 0xB2, 0x1E], 0);
  return b58.encode(data);
};

/**
 * ₿ DERIVE NATIVE SEGWIT ADDRESS (bc1...)
 * Path: m/0/index
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    if (!xpub) throw new Error('BITCOIN_XPUB is undefined in environment');
    
    const cleanXpub = convertToXpub(xpub);
    const node = bip32.fromBase58(cleanXpub, NETWORK);
    
    // Standard external derivation path
    const child = node.derive(0).derive(index);
    
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK
    });
    
    return address;
  } catch (error) {
    console.error(`[BTC Utils] Derivation Error: ${error.message}`);
    return null;
  }
};

/**
 * ✅ ALIAS FOR BACKWARD COMPATIBILITY
 * Fixes the SyntaxError in addressService.js
 */
export const deriveAddressFromXpub = deriveBtcAddress;

/**
 * 💰 GET BTC BALANCE (Blockchain.info API)
 */
export const getBtcBalance = async (address) => {
  try {
    if (!address) return 0;
    const response = await fetch(`https://blockchain.info{address}?cors=true`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data.final_balance / 100_000_000;
  } catch (error) {
    console.error(`[BTC Utils] Balance Fetch Fail:`, error.message);
    return 0;
  }
};

/**
 * 🔗 GET TX CONFIRMATIONS
 */
export const getBtcTxConfirmations = async (txid) => {
  try {
    if (!txid) return 0;
    const response = await fetch(`https://blockchain.info{txid}?cors=true`);
    if (!response.ok) return 0;
    
    const data = await response.json();
    if (!data.block_height) return 0;

    const blockCountRes = await fetch('https://blockchain.info');
    const currentHeight = parseInt(await blockCountRes.text());
    
    return currentHeight - data.block_height + 1;
  } catch (error) {
    console.error(`[BTC Utils] Confirmation Error:`, error.message);
    return 0;
  }
};

