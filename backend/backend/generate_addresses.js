// backend/generate_addresses.js
import { deriveAddress } from './config/bitcoin.js';

const types = ['legacy', 'nestedSegwit', 'nativeSegwit'];
const count = 5;

types.forEach((type) => {
  console.log(`\n=== ${type} addresses ===`);
  for (let i = 0; i < count; i++) {
    const { address, path } = deriveAddress(i, type);
    console.log(`${i}: ${address} (path: ${path})`);
  }
});
