import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

// 2026 Standard: Wrapper for the ECC library
const bip32 = BIP32Factory(ecc);

/**
 * Derives a Native SegWit (bc1) address using BIP84 path
 * Standard Path: m/84'/0'/0'/0/index
 */
export const deriveBtcAddress = (xpub, index) => {
  try {
    if (!xpub) throw new Error("XPUB is required for derivation");
    
    // xpub is the public half of the HD wallet
    const node = bip32.fromBase58(xpub);
    
    // We derive from the external chain (0) at the specified index
    // Path: m/0/index (assuming account-level xpub provided)
    const child = node.derive(0).derive(index);
    
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin,
    });
    
    return address;
  } catch (error) {
    console.error("Critical Derivation Error:", error.message);
    // Returning an error-coded address to prevent silent failures in DB
    return `error_derivation_${index}_${Date.now()}`;
  }
};

// Alias for compatibility with addressService.js
export const deriveAddressFromXpub = deriveBtcAddress;

/**
 * Get BTC transaction details with fixed 2026 BlockCypher API URL
 */
export async function getBtcTxConfirmations(txHash) {
  try {
    // BlockCypher v1 is the stable standard in 2026
    const url = `https://api.blockcypher.com{txHash}`;
    const response = await axios.get(url);
    return response.data.confirmations || 0;
  } catch (err) {
    console.error("BlockCypher Tx Error:", err.message);
    return null;
  }
}

/**
 * Check balance with fixed 2026 BlockCypher API URL
 */
export async function getAddressBalance(address) {
  try {
    const url = `https://api.blockcypher.com{address}/balance`;
    const response = await axios.get(url);
    // BlockCypher returns balance in satoshis; convert to BTC
    return response.data.balance / 100000000;
  } catch (err) {
    console.error("BlockCypher Balance Error:", err.message);
    return 0;
  }
}

