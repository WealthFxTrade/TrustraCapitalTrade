import * as bitcoin from 'bitcoinjs-lib';
import { deriveAddress } from '../config/bitcoin.js';

/**
 * Generate a single BTC address (native SegWit by default)
 * @param {number} index - Address index
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} type - Address type
 * @returns {string} Bitcoin address
 */
export const generateBtcAddress = (index = 0, type = 'nativeSegwit') => {
  const { address } = deriveAddress(index, type);
  return address;
};

/**
 * Generate multiple BTC addresses at once
 * @param {number} count - Number of addresses to generate
 * @param {number} startIndex - Starting index (default 0)
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} type - Address type
 * @returns {Array<{ index: number, address: string, path: string, pubKey: string }>}
 */
export const generateBtcAddresses = (count = 1, startIndex = 0, type = 'nativeSegwit') => {
  const addresses = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const { address, path, publicKey } = deriveAddress(index, type);
    addresses.push({
      index,
      address,
      path,
      pubKey: publicKey.toString('hex'),
    });
  }
  return addresses;
};

// ──────────────────────────────────────────────
// Example usage (can remove in production)
if (require.main === module) {
  console.log('Single BTC address:', generateBtcAddress(0));

  console.log('Batch of 5 BTC addresses:');
  console.table(generateBtcAddresses(5));
}
