// generate_xpub.js
import * as bitcoin from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';

// Network: Bitcoin mainnet
const network = bitcoin.networks.bitcoin;

// Create BIP32 factory with ECC
const BIP32 = bip32.BIP32Factory(ecc);

// Generate random seed
const seed = crypto.randomBytes(32);
const root = BIP32.fromSeed(seed, network);

// Get master XPUB
const xpub = root.neutered().toBase58();

// Derive first child address (BIP84: m/84'/0'/0'/0/0)
const child = root.derivePath("m/84'/0'/0'/0/0");
const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network });

console.log('=== Bitcoin HD Wallet Generator ===');
console.log('Master XPUB:', xpub);
console.log('Example derived address (first child):', address);
