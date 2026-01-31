// backend/utils/generateBtcAddress.js
import * as bitcoin from 'bitcoinjs-lib';
import { root, network } from '../config/bitcoin.js';

/**
 * Generate a native SegWit (Bech32 P2WPKH) BTC address from HD derivation index
 * @param {number} index - Child index (non-hardened)
 * @returns {string} BTC address (bc1q...)
 * @throws {Error} if root not initialized or generation fails
 */
export function generateBtcAddress(index) {
  if (!root) {
    throw new Error('HD root node (xpub/zpub/ypub) not initialized in bitcoin config');
  }

  if (!Number.isInteger(index) || index < 0) {
    throw new Error('Index must be a non-negative integer');
  }

  const child = root.derivePath(`0/${index}`);

  const payment = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network,
  });

  if (!payment.address) {
    throw new Error('Failed to generate BTC address – invalid public key or network');
  }

  return payment.address;
}

/**
 * Generate address with debug/test information
 * NEVER expose WIF/private key in production API responses!
 * @param {number} index
 * @returns {object} { address, derivationPath, publicKey, wif? }
 */
export function generateAddressWithDetails(index) {
  if (!root) {
    throw new Error('HD root node not initialized');
  }

  const path = `0/${index}`;
  const child = root.derivePath(path);

  const payment = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network,
  });

  if (!payment.address) {
    throw new Error('Failed to generate address – invalid public key or network');
  }

  return {
    address: payment.address,
    derivationPath: path,
    publicKey: child.publicKey.toString('hex'),
    // Only expose WIF in non-production environments (testing/debug)
    ...(process.env.NODE_ENV !== 'production' && child.privateKey && {
      wif: child.toWIF(),
    }),
  };
}

// ──────────────────────────────────────────────
// Direct execution (run file with: node utils/generateBtcAddress.js)
// ──────────────────────────────────────────────
if (process.argv[1] === new URL(import.meta.url).pathname) {
  (async () => {
    try {
      console.log('Generating address at index 0...');
      const address = generateBtcAddress(0);
      console.log('Native SegWit (bc1q...) address:', address);

      if (process.env.NODE_ENV !== 'production') {
        const details = generateAddressWithDetails(0);
        console.log('Details:', details);
      }
    } catch (err) {
      console.error('Address generation failed:', err.message);
      process.exitCode = 1;
    }
  })();
}
