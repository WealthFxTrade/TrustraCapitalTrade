// backend/config/bitcoin.js
import dotenv from 'dotenv';
import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

dotenv.config();

// ──────────────────────────────────────────────
// Initialize BIP32 (safe: ECC backend injected)
// ──────────────────────────────────────────────
const bip32 = BIP32Factory(ecc);

// ──────────────────────────────────────────────
// Required environment variable check
// ──────────────────────────────────────────────
if (!process.env.BITCOIN_XPUB) {
  throw new Error(
    'BITCOIN_XPUB is not defined in environment variables.\n' +
    'Set it to your xpub / ypub / zpub extended public key.'
  );
}

const xpub = process.env.BITCOIN_XPUB.trim();

// ──────────────────────────────────────────────
// Detect network & address type
// ──────────────────────────────────────────────
let network = bitcoin.networks.bitcoin;
let addressType;

switch (true) {
  case xpub.startsWith('xpub'):
    addressType = 'legacy'; // BIP44 (P2PKH)
    break;

  case xpub.startsWith('ypub'):
    addressType = 'nested-segwit'; // BIP49 (P2SH-P2WPKH)
    break;

  case xpub.startsWith('zpub'):
    addressType = 'native-segwit'; // BIP84 (P2WPKH)
    break;

  case xpub.startsWith('tpub'):
    addressType = 'legacy';
    network = bitcoin.networks.testnet;
    break;

  case xpub.startsWith('upub'):
    addressType = 'nested-segwit';
    network = bitcoin.networks.testnet;
    break;

  case xpub.startsWith('vpub'):
    addressType = 'native-segwit';
    network = bitcoin.networks.testnet;
    break;

  default:
    throw new Error(
      'Invalid extended public key prefix.\n' +
      'Expected xpub, ypub, zpub (mainnet) or tpub, upub, vpub (testnet).'
    );
}

// ──────────────────────────────────────────────
// Parse extended public key → neutered BIP32 root
// ──────────────────────────────────────────────
let root;
try {
  root = bip32.fromBase58(xpub, network);
} catch (err) {
  throw new Error(`Failed to parse BITCOIN_XPUB: ${err.message}`);
}

// ──────────────────────────────────────────────
// Security check: MUST be public-only
// ──────────────────────────────────────────────
if (root.privateKey) {
  throw new Error(
    'BITCOIN_XPUB appears to be a private key (xprv / yprv / zprv).\n' +
    'NEVER use private keys on the backend.'
  );
}

// ──────────────────────────────────────────────
// Address derivation (account 0 / external chain)
// ──────────────────────────────────────────────
export function deriveAddress(index) {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error('Address index must be a non-negative integer');
  }

  // BIP44/49/84: m/…/0/index
  const child = root.derive(0).derive(index);

  switch (addressType) {
    case 'legacy':
      return bitcoin.payments.p2pkh({
        pubkey: child.publicKey,
        network,
      }).address;

    case 'nested-segwit':
      return bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network,
        }),
        network,
      }).address;

    case 'native-segwit':
      return bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network,
      }).address;

    default:
      throw new Error('Unsupported address type');
  }
}

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────
export { root, network, addressType };
