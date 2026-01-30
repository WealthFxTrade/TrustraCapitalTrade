// backend/config/bitcoin.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

// ──────────────────────────────────────────────
// BIP32 instance (using tiny-secp256k1 as recommended ECC lib)
export const bip32 = BIP32Factory(ecc);

// ──────────────────────────────────────────────
// Network (mainnet default, testnet via env)
export const network = process.env.BITCOIN_NETWORK === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin;

export const isMainnet = network === bitcoin.networks.bitcoin;

// ──────────────────────────────────────────────
// Root node from XPUB (extended public key)
if (!process.env.BITCOIN_XPUB) {
  throw new Error(
    'BITCOIN_XPUB is not defined in environment variables. ' +
    'Set it to your xpub/ypub/zpub key.'
  );
}

export let rootNode;
try {
  rootNode = bip32.fromBase58(process.env.BITCOIN_XPUB, network);
} catch (err) {
  throw new Error(`Invalid BITCOIN_XPUB format: ${err.message}`);
}

// Export the root node under the name 'root' for compatibility with your existing imports
export const root = rootNode;

// ──────────────────────────────────────────────
// Standard derivation paths (BIP44 / BIP49 / BIP84)
export const paths = {
  legacy: `m/44'/${isMainnet ? 0 : 1}'/0'/0`,          // P2PKH
  nestedSegwit: `m/49'/${isMainnet ? 0 : 1}'/0'/0`,    // P2SH-P2WPKH
  nativeSegwit: `m/84'/${isMainnet ? 0 : 1}'/0'/0`,    // P2WPKH (recommended)
};

/**
 * Derive a Bitcoin address at a specific index
 * @param {number} index - Address index (0, 1, 2...)
 * @param {'legacy'|'nestedSegwit'|'nativeSegwit'} [type='nativeSegwit']
 * @returns {{ address: string, path: string, publicKey: Buffer }}
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

// Optional: clean API export
export const bitcoinConfig = {
  network,
  isMainnet,
  bip32,
  rootNode,
  root,               // ← for compatibility
  paths,
  deriveAddress,
  getNextReceiveAddress,
};
