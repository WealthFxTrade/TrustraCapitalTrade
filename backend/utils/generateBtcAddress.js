import { deriveAddress } from '../config/bitcoin.js';
import url from 'url';

// ES module helpers
const __filename = url.fileURLToPath(import.meta.url);

/**
 * Generate a single BTC address
 * @param {number} index - Address index
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} type - Address type (default: 'nativeSegwit')
 * @returns {string} BTC address
 */
export const generateBtcAddress = (index = 0, type = 'nativeSegwit') => {
  const { address } = deriveAddress(index, type);
  return address;
};

/**
 * Generate multiple BTC addresses
 * @param {number} count - Number of addresses
 * @param {number} startIndex - Starting index (default 0)
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} type - Address type (default: 'nativeSegwit')
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

// Test block
if (process.argv[1] === __filename) {
  console.log('Single BTC address:', generateBtcAddress(0));

  console.log('Batch of 5 BTC addresses:');
  console.table(generateBtcAddresses(5));
}
