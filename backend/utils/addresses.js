// backend/utils/addresses.js
import { bitcoinConfig } from '../config/bitcoin.js';

/**
 * Generate a single BTC address at a given index and type
 * @param {number} index - Address index
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} type - Address type
 * @returns {string} Bitcoin address
 */
export function generateBtcAddress(index = 0, type = 'nativeSegwit') {
  const { address } = bitcoinConfig.deriveAddress(index, type);
  return address;
}

/**
 * Generate multiple BTC addresses in a batch
 * @param {number} count - Number of addresses
 * @param {number} startIndex - Start index
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} type - Address type
 * @returns {Array<{ index: number, address: string }>}
 */
export function generateBtcAddresses(count = 5, startIndex = 0, type = 'nativeSegwit') {
  const addresses = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    addresses.push({
      index,
      address: generateBtcAddress(index, type),
    });
  }
  return addresses;
}
