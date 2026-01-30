// backend/config/bitcoin.js
import dotenv from 'dotenv';
dotenv.config(); // Must be first

import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

// ──────────────────────────────
// BIP32 instance (tiny-secp256k1)
export const bip32 = BIP32Factory(ecc);

// ──────────────────────────────
// Network (mainnet by default)
export const network = process.env.BITCOIN_NETWORK === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin;

export const isMainnet = network === bitcoin.networks.bitcoin;

// ──────────────────────────────
// Root node from XPUB
if (!process.env.BITCOIN_XPUB) {
  throw new Error(
    'BITCOIN_XPUB is not defined in environment variables. Set it to your xpub/ypub/zpub key.'
  );
}

export const rootNode = bip32.fromBase58(process.env.BITCOIN_XPUB, network);
export const root = rootNode;

// ──────────────────────────────
// XPUB-safe derivation paths (non-hardened)
export const paths = {
  legacy: '0',       // XPUB-safe branch
  nestedSegwit: '0', // XPUB-safe branch
  nativeSegwit: '0', // XPUB-safe branch
};

/**
 * Derive a Bitcoin address at a specific index from XPUB
 * @param {number} index - Address index (0, 1, 2...)
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} [type='nativeSegwit']
 * @returns {{ address: string, path: string, publicKey: Buffer }}
 */
export function deriveAddress(index = 0, type = 'nativeSegwit') {
  const pathPrefix = paths[type];
  if (!pathPrefix) throw new Error(`Invalid address type: ${type}`);

  const path = `${pathPrefix}/${index}`; // XPUB-safe path
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
    address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }).address;
  }

  return { address, path, publicKey: child.publicKey };
}

/**
 * Quick helper: get next receive address (native SegWit)
 */
export function getNextReceiveAddress(index = 0) {
  return deriveAddress(index, 'nativeSegwit');
}

// Optional export
export const bitcoinConfig = {
  network,
  isMainnet,
  bip32,
  rootNode,
  root,
  paths,
  deriveAddress,
  getNextReceiveAddress,
};
