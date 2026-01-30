// backend/utils/generateBtcAddress.js
import { deriveAddress } from '../config/bitcoin.js';
import url from 'url';

// ES module equivalents of __filename and __dirname
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Generate and print multiple Bitcoin addresses of different types
 * @param {number} count - how many addresses per type
 */
export function generateAddresses(count = 5) {
  const types = ['legacy', 'nestedSegwit', 'nativeSegwit'];

  types.forEach((type) => {
    console.log(`\n=== ${type} addresses ===`);
    for (let i = 0; i < count; i++) {
      const addr = deriveAddress(i, type);
      console.log(`${i}: ${addr.address} (path: ${addr.path})`);
    }
  });
}

// If the script is run directly, generate addresses
if (process.argv[1] === __filename) {
  generateAddresses(5);
}
