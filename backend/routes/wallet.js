import express from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const bip32 = BIP32Factory(ecc);

router.post('/:asset', protect, async (req, res) => {
  try {
    const { asset } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Return existing address if available (prevents unnecessary re-generation)
    if (user.depositAddresses && user.depositAddresses.get(asset)) {
      return res.json({ success: true, address: user.depositAddresses.get(asset) });
    }

    let address;
    const index = parseInt(userId.toString().slice(-6), 16) || 0;

    if (asset === 'BTC') {
      const XPUB = process.env.BITCOIN_XPUB;
      if (!XPUB) throw new Error("BITCOIN_XPUB is missing in environment");

      // FIXED: Must explicitly define the network for BIP32
      const network = bitcoin.networks.bitcoin; 
      const node = bip32.fromBase58(XPUB, network);
      
      // Path: m/0/index
      const child = node.derive(0).derive(index);

      address = bitcoin.payments.p2wpkh({ 
        pubkey: child.publicKey, 
        network 
      }).address;

    } else if (asset === 'ETH' || asset === 'USDT') {
      const mnemonic = process.env.ETH_MNEMONIC;
      if (!mnemonic) throw new Error("ETH_MNEMONIC is missing in environment");

      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      // Path: m/44'/60'/0'/0/index
      address = wallet.deriveChild(index).address;
    }

    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(asset, address);
    
    // CRITICAL: Mongoose needs this to detect changes in a Map
    user.markModified('depositAddresses'); 
    await user.save();

    res.json({ success: true, address });
  } catch (err) {
    console.error('[TRUSTRA_NODE_ERROR]:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Blockchain Node Sync Failed',
      detail: process.env.NODE_ENV === 'development' ? err.message : null 
    });
  }
});

export default router;

