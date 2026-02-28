import User from '../models/User.js';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';

// Initialize BIP32 with the secp256k1 library
const bip32 = BIP32Factory(ecc);

/**
 * Generates a unique, deterministic deposit address.
 * Uses Native SegWit (Bech32) for BTC to minimize transaction fees.
 */
export const getDepositAddress = async (userId, asset = 'BTC') => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Investor node not found');

    // 1. Return existing address if already generated
    if (user.depositAddresses?.get(asset)) {
      return { address: user.depositAddresses.get(asset), asset };
    }

    // 2. Derive index from User ID hash (Deterministic mapping)
    const hash = crypto.createHash('sha256').update(userId.toString()).digest('hex');
    const index = parseInt(hash.slice(0, 7), 16) % 2147483647;

    let generatedAddress;

    if (asset === 'BTC') {
      const XPUB = process.env.BITCOIN_XPUB;
      if (!XPUB) throw new Error("BITCOIN_XPUB missing in secure environment");

      const network = bitcoin.networks.bitcoin;
      
      // Fix: bip32.fromBase58 is strict. Ensure your .env XPUB is the standard 'xpub...' 
      // If using Ledger/Trezor 'zpub', it may need conversion to 'xpub' first.
      const node = bip32.fromBase58(XPUB, network);
      
      // Standard Internal/External derivation path
      const child = node.derive(0).derive(index);

      // Generate Native SegWit (bc1...) address
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network
      });
      generatedAddress = address;

    } else if (asset === 'ETH' || asset === 'USDT' || asset === 'USDC') {
      const mnemonic = process.env.ETH_MNEMONIC;
      if (!mnemonic) throw new Error("ETH_MNEMONIC missing in secure environment");

      // Ethers v6 Syntax Fix: use fromPhrase and then deriveChild
      const masterNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const wallet = masterNode.derivePath(`m/44'/60'/0'/0/${index}`);
      generatedAddress = wallet.address;
      
    } else {
      throw new Error(`Asset ${asset} is not yet supported by Trustra Node`);
    }

    // 3. Persist to Database
    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(asset, generatedAddress);

    // Critical for Mongoose Maps
    user.markModified('depositAddresses');
    await user.save();

    return { address: generatedAddress, asset };

  } catch (err) {
    console.error(`[WalletService Critical]: ${err.message}`);
    throw err;
  }
};

export default { getDepositAddress };
