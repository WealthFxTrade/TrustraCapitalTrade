// backend/utils/bitcoinUtils.js

import axios from 'axios'; // add to dependencies if not present: npm install axios

/**
 * Derives a Bitcoin address from an xpub and index (placeholder or real implementation)
 * @param {string} xpub - Extended public key
 * @param {number} index - Derivation index
 * @returns {string} Derived address
 */
export const deriveBtcAddress = (xpub, index) => {
  console.log(`Deriving BTC address for index: ${index}`);
  
  // Placeholder – replace with real derivation using bitcoinjs-lib + bip32/bip44 if needed
  // Example real implementation (uncomment & install bitcoinjs-lib, tiny-secp256k1, bip32):
  // const { BIP32Factory } = require('bip32');
  // const ecc = require('tiny-secp256k1');
  // const bip32 = BIP32Factory(ecc);
  // const node = bip32.fromBase58(xpub);
  // const child = node.derivePath(`m/84'/0'/0'/0/${index}`);
  // return bitcoin.payments.p2wpkh({ pubkey: child.publicKey }).address;
  
  return `bc1_placeholder_address_${index}`;
};

/**
 * Fetches the number of confirmations for a Bitcoin transaction
 * Uses public mempool.space API (reliable, no key needed, rate-limited)
 * @param {string} txHash - Transaction ID (txid)
 * @returns {number|null} Number of confirmations, or null if not found/error
 */
export async function getBtcTxConfirmations(txHash) {
  if (!txHash || typeof txHash !== 'string' || txHash.length < 64) {
    console.warn('[bitcoinUtils] Invalid txHash format');
    return null;
  }

  try {
    const url = `https://mempool.space/api/tx/${txHash}`;
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
      headers: { 'User-Agent': 'TrustraCapital/DepositWatcher' }
    });

    const tx = response.data;

    if (!tx || !tx.status) {
      console.warn(`[bitcoinUtils] Tx not found: ${txHash}`);
      return null;
    }

    if (!tx.status.confirmed) {
      return 0; // seen but 0 conf
    }

    // mempool.space provides block_height; confirmations = current_height - block_height + 1
    const currentHeightUrl = 'https://mempool.space/api/blocks/tip/height';
    const heightRes = await axios.get(currentHeightUrl, { timeout: 5000 });
    const currentHeight = heightRes.data;

    const confirmations = currentHeight - tx.status.block_height + 1;

    return Math.max(0, confirmations);
  } catch (err) {
    console.error(`[bitcoinUtils] Failed to fetch confirmations for ${txHash}:`, err.message);
    return null; // fail gracefully – don't crash cron
  }
}
