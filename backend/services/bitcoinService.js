import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import User from '../models/User.js';

const bip32 = BIP32Factory(ecc);
const NETWORK = process.env.BITCOIN_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
const XPUB = process.env.BITCOIN_XPUB;

/**
 * Generate or fetch a unique BTC Bech32 address for a Trustra user
 */
export const getDepositAddress = async (userId) => {
  if (!XPUB) throw new Error('BITCOIN_XPUB is missing from environment');

  const user = await User.findById(userId);
  if (!user) throw new Error('Investor not found in Trustra database');

  // Initialize if empty
  if (!user.depositAddresses) {
    user.depositAddresses = new Map();
  }

  // Only generate if user doesn’t already have a BTC address assigned
  if (!user.depositAddresses.get('BTC')) {
    try {
      const node = bip32.fromBase58(XPUB, NETWORK);

      // Unique derivation index using the tail-end of the MongoDB ID
      const index = parseInt(userId.toString().slice(-6), 16) || 0;

      // Standard BIP44/84 style derivation path
      const child = node.derivePath(`0/${index}`);

      // Generate Native SegWit (Bech32 - bc1...) for lowest transaction fees
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: NETWORK,
      });

      user.depositAddresses.set('BTC', address);
      
      // Ensure Mongoose tracks the change in the Map
      await user.save();
    } catch (err) {
      console.error('Trustra Node Error (BTC Gen):', err);
      throw new Error('Cryptographic derivation failed');
    }
  }

  return { depositAddress: user.depositAddresses.get('BTC') };
};

