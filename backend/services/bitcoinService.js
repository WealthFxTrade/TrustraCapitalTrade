import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import User from '../models/User.js';

const bip32 = BIP32Factory(ecc);

/**
 * Generate or fetch a unique BTC Bech32 address for a Trustra user
 * Uses Atomic Counter (btcIndex) to prevent address collisions.
 */
export const getDepositAddress = async (userId) => {
  const XPUB = process.env.BITCOIN_XPUB;
  const NETWORK = process.env.BITCOIN_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

  if (!XPUB) throw new Error('BITCOIN_XPUB is missing from environment');

  const user = await User.findById(userId);
  if (!user) throw new Error('Investor not found in Trustra database');

  // 1️⃣ If the user already has an address, return it immediately
  if (user.btcAddress) {
    return { depositAddress: user.btcAddress };
  }

  try {
    // 2️⃣ Get a unique index from the System Counter document
    // This ensures no two users ever share an index
    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const uniqueIndex = counterDoc.btcIndexCounter;
    const node = bip32.fromBase58(XPUB, NETWORK);

    // 3️⃣ Standard BIP84 derivation (m/0/index)
    const child = node.derive(0).derive(uniqueIndex);

    // 4️⃣ Generate Native SegWit (Bech32 - bc1...)
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK,
    });

    // 5️⃣ Save to User profile
    user.btcAddress = address;
    user.btcIndex = uniqueIndex;
    
    // Also sync with your Map if you use it for the frontend
    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set('BTC', address);

    await user.save();
    return { depositAddress: address };

  } catch (err) {
    console.error('Trustra Node Error (BTC Gen):', err.message);
    throw new Error('Cryptographic derivation failed');
  }
};

