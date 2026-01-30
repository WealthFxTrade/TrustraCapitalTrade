// backend/config/bitcoin.js
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';  // ← correct named import
import * as ecc from 'tiny-secp256k1';

// Create BIP32 instance with ECC library
export const bip32 = BIP32Factory(ecc);

// Bitcoin network (mainnet by default, testnet via env)
export const network = process.env.BITCOIN_NETWORK === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin;

export const isMainnet = network === bitcoin.networks.bitcoin;

// Root node from XPUB
if (!process.env.BITCOIN_XPUB) {
  throw new Error('BITCOIN_XPUB is not defined in environment variables');
}

export let rootNode;
try {
  rootNode = bip32.fromBase58(process.env.BITCOIN_XPUB, network);
} catch (err) {
  throw new Error(`Invalid BITCOIN_XPUB format: ${err.message}`);
}
