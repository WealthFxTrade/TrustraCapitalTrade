// backend/config/bitcoin.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';          // ← named import (correct)
import * as ecc from 'tiny-secp256k1';

// Create BIP32 instance with ECC library
export const bip32 = BIP32Factory(ecc);

// Bitcoin network (mainnet by default, or testnet via env)
export const network = process.env.BITCOIN_NETWORK === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin;

export const isMainnet = network === bitcoin.networks.bitcoin;

// Root node from XPUB
if (!process.env.BITCOIN_XPUB) {
  throw new Error('BITCOIN_XPUB is not defined in environment variables');
}

let root;
try {
  root = bip32.fromBase58(process.env.BITCOIN_XPUB, network);
} catch (err) {
  throw new Error(`Invalid BITCOIN_XPUB format: ${err.message}`);
}

export const rootNode = root;

// ──────────────────────────────────────────────
//  Standard derivation paths
// ──────────────────────────────────────────────
export const paths = {
  legacy: `m/44'/${isMainnet ? 0 : 1}'/0'/0`,          // BIP44 (P2PKH)
  nestedSegwit: `m/49'/${isMainnet ? 0 : 1}'/0'/0`,    // BIP49 (P2SH-P2WPKH)
  nativeSegwit: `m/84'/${isMainnet ? 0 : 1}'/0'/0`,    // BIP84 (P2WPKH)
};

/**
 * Derive a Bitcoin address at a specific index
 * @param {number} index - Address index (0, 1, 2...)
 * @param {'legacy' | 'nestedSegwit' | 'nativeSegwit'} [type='nativeSegwit']
 * @returns {{ address: string, path: string }}
 */
export function deriveAddress(index = 0, type = 'nativeSegwit') {
  const pathPrefix = paths[type];
  if (!pathPrefix) throw new Error(`Invalid address type: ${type}`);

  const path = `\( {pathPrefix}/ \){index}`;
  const child = rootNode.derivePath(path);

  let address;
  if (type === 'legacy') {
    address = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network }).address;
  } else if (type === 'nestedSegwit') {
    address = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }),
      network,
    }).address;
  } else {
    // nativeSegwit (default)
    address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }).address;
  }

  return { address, path };
}

/**
 * Get next receive address (example – track index in DB per user)
 */
export function getNextReceiveAddress(index = 0) {
  return deriveAddress(index, 'nativeSegwit');
}

// Export everything as a clean API
export const bitcoinConfig = {
  network,
  isMainnet,
  bip32,
  rootNode,
  paths,
  deriveAddress,
  getNextReceiveAddress,
};
