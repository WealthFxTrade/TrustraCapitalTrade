import express from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto'; // Added for more reliable indexing
import User from '../models/User.js'; 
import { protect } from '../middleware/auth.js';

const router = express.Router();
const bip32 = BIP32Factory(ecc);

router.post('/:asset', protect, async (req, res) => {
  try {
    const { asset } = req.params;
    const userId = req.user._id.toString();

    // 1. Validate supported assets
    if (!['BTC', 'ETH', 'USDT'].includes(asset)) {
      return res.status(400).json({ success: false, message: 'Unsupported asset' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Return existing address to prevent fragmentation
    if (user.depositAddresses && user.depositAddresses.get(asset)) {
      return res.json({ success: true, address: user.depositAddresses.get(asset) });
    }

    let address;

    // 3. Robust Index Derivation: Hash the userId to a 31-bit integer
    // This prevents collisions better than string slicing and fits BIP32 constraints
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const index = parseInt(hash.slice(0, 7), 16); 

    if (asset === 'BTC') {
      const XPUB = process.env.BITCOIN_XPUB;
      if (!XPUB) throw new Error("BITCOIN_XPUB environment variable is missing");

      const network = bitcoin.networks.bitcoin; 
      const node = bip32.fromBase58(XPUB, network);
      
      // Path: m/0/index (Standard for Receive addresses in watch-only wallets)
      const child = node.derive(0).derive(index);
      address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }).address;

    } else if (asset === 'ETH' || asset === 'USDT') {
      const mnemonic = process.env.ETH_MNEMONIC;
      if (!mnemonic) throw new Error("ETH_MNEMONIC environment variable is missing");

      const masterNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      // Path: m/44'/60'/0'/0/index (BIP-44 Standard)
      const childNode = masterNode.derivePath(`m/44'/60'/0'/0/${index}`);
      address = childNode.address;
    }

    // 4. Save to Database
    if (!user.depositAddresses) {
      user.depositAddresses = new Map();
    }
    
    user.depositAddresses.set(asset, address);
    user.markModified('depositAddresses'); 
    await user.save();

    return res.json({ success: true, address });

  } catch (error) {
    console.error(`[Wallet Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate deposit address' });
  }
});

export default router;

