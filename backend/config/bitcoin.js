// backend/config/bitcoin.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

// BIP32 instance (tiny-secp256k1 is the recommended ECC lib for bitcoinjs-lib v6+)
const bip32 = BIP32Factory(ecc);

// ──────────────────────────────────────────────
//  Network configuration
// ──────────────────────────────────────────────
export const NETWORK = process.env.BITCOIN_NETWORK === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin;

export const IS_MAINNET = NETWORK === bitcoin.networks.bitcoin;

// ──────────────────────────────────────────────
//  XPUB (extended public key) from environment
// ──────────────────────────────────────────────
if (!process.env.BITCOIN_XPUB) {
  throw new Error(
    'BITCOIN_XPUB is not defined in environment variables. ' +
    'Set it to your extended public key (xpub/ypub/zpub...)'
  );
}

let rootNode;
try {
  rootNode = bip32.fromBase58(process.env.BITCOIN_XPUB, NETWORK);
} catch (err) {
  throw new Error(`Invalid BITCOIN_XPUB format: ${err.message}`);
}

// ──────────────────────────────────────────────
//  Standard derivation paths (BIP44, BIP84)
// ──────────────────────────────────────────────
export const DERIVATION_PATHS = {
  // Legacy (P2PKH) — BIP44
  legacy: `m/44'/${IS_MAINNET ? 0 : 1}'/0'/0`,
  // Native SegWit (P2WPKH) — BIP84
  nativeSegwit: `m/84'/${IS_MAINNET ? 0 : 1}'/0'/0`,
  // Nested SegWit (P2SH-P2WPKH) — BIP49
  nestedSegwit: `m/49'/${IS_MAINNET ? 0 : 1}'/0'/0`,
};

/**
 * Derive a Bitcoin address at a specific index using the given path prefix
 * @param {number} index - Change (0=receive, 1=change) and address index
 * @param {'legacy' | 'nativeSegwit' | 'nestedSegwit'} [type='nativeSegwit']
 * @returns {{ address: string, path: string, publicKey: Buffer }}
 */
export function deriveAddress(index = 0, type = 'nativeSegwit') {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error('Index must be a non-negative integer');
  }

  const pathPrefix = DERIVATION_PATHS[type];
  if (!pathPrefix) {
    throw new Error(`Invalid address type: ${type}`);
  }

  const path = `\( {pathPrefix}/ \){index}`;
  const child = rootNode.derivePath(path);

  let address;
  if (type === 'legacy') {
    address = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: NETWORK }).address;
  } else if (type === 'nestedSegwit') {
    address = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: NETWORK }),
      network: NETWORK,
    }).address;
  } else {
    // nativeSegwit (default)
    address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: NETWORK }).address;
  }

  return {
    address,
    path,
    publicKey: child.publicKey,
    privateKey: child.privateKey ? child.privateKey.toString('hex') : null, // only if hardened path allows
  };
}

/**
 * Get the next unused receive address (example — you would track used indices in DB)
 * @param {number} [startIndex=0]
 */
export function getNextReceiveAddress(startIndex = 0) {
  return deriveAddress(startIndex, 'nativeSegwit');
}

// Export everything as a clean API object
export const bitcoinConfig = {
  network: NETWORK,
  isMainnet: IS_MAINNET,
  rootNode,
  deriveAddress,
  getNextReceiveAddress,
  paths: DERIVATION_PATHS,
};
