import User from '../models/User.js';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';

const bip32 = BIP32Factory(ecc);

/**
 * Generates a unique, deterministic deposit address for a user.
 * @param {string} userId - The Mongoose User ID string.
 * @param {string} asset - The asset type (BTC, ETH, USDT).
 * @returns {Promise<Object>} - The generated addresses.
 */
export const getDepositAddress = async (userId, asset = 'BTC') => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // 1. Check if the address already exists in the User's Map
    if (user.depositAddresses && user.depositAddresses.get(asset)) {
      return { 
        address: user.depositAddresses.get(asset),
        asset 
      };
    }

    // 2. Derive a deterministic index from the User ID (0 to 2,147,483,647)
    const hash = crypto.createHash('sha256').update(userId.toString()).digest('hex');
    const index = parseInt(hash.slice(0, 7), 16);

    let generatedAddress;

    if (asset === 'BTC') {
      const XPUB = process.env.BITCOIN_XPUB;
      if (!XPUB) throw new Error("BITCOIN_XPUB is missing in environment");

      const network = bitcoin.networks.bitcoin;
      const node = bip32.fromBase58(XPUB, network);
      // Path: m/0/index
      const child = node.derive(0).derive(index);
      
      generatedAddress = bitcoin.payments.p2wpkh({ 
        pubkey: child.publicKey, 
        network 
      }).address;

    } else if (asset === 'ETH' || asset === 'USDT') {
      const mnemonic = process.env.ETH_MNEMONIC;
      if (!mnemonic) throw new Error("ETH_MNEMONIC is missing in environment");

      const masterNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      // Standard BIP-44 path: m/44'/60'/0'/0/index
      generatedAddress = masterNode.derivePath(`m/44'/60'/0'/0/${index}`).address;
    } else {
      throw new Error(`Unsupported asset type: ${asset}`);
    }

    // 3. Save the new address to the User's Map for persistence
    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(asset, generatedAddress);
    
    user.markModified('depositAddresses');
    await user.save();

    return { 
      address: generatedAddress, 
      asset 
    };

  } catch (err) {
    console.error(`[WalletService Error]: ${err.message}`);
    throw new Error(`Failed to generate ${asset} deposit address: ${err.message}`);
  }
};

// Example of exporting multiple functions (common in ESM)
export default {
  getDepositAddress,
};

