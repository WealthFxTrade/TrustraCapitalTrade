import express from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

import User from '../models/User.js';
import { adminAuth } from '../middleware/adminAuth.js'; // Protect these routes

const router = express.Router();
const bip32 = BIP32Factory(ecc);

/**
 * @route   POST /api/wallet/generate
 * @desc    Generate a permanent deposit address for an investor
 */
router.post('/generate', async (req, res) => {
  try {
    const { type, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Investor not found' });
    }

    let address;

    if (type === 'BTC') {
      // 1. USE XPUB (Safe way to generate addresses you control)
      const XPUB = process.env.BITCOIN_XPUB;
      const NETWORK = process.env.BITCOIN_NETWORK === 'mainnet' 
        ? bitcoin.networks.bitcoin 
        : bitcoin.networks.testnet;

      const node = bip32.fromBase58(XPUB, NETWORK);
      const index = parseInt(userId.toString().slice(-6), 16) || 0;
      const child = node.derivePath(`0/${index}`);
      
      // Native SegWit (Bech32) - starts with bc1
      address = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: NETWORK,
      }).address;

    } else if (type === 'ETH' || type === 'USDT_ERC20') {
      // 2. Generate ETH/USDT address using a fixed Mnemonic/HDNode
      // In 2026, we derive from a seed so you can recover funds later
      const mnemonic = process.env.ETH_MNEMONIC; 
      const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const index = parseInt(userId.toString().slice(-6), 16) || 0;
      const child = hdNode.deriveChild(index);
      
      address = child.address;

    } else {
      return res.status(400).json({ success: false, message: 'Invalid Trustra Node Type' });
    }

    // 3. Save to the User Document directly (Cleaner for your Dashboard stats)
    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(type, address);
    await user.save();

    res.json({ success: true, address });
  } catch (err) {
    console.error('Trustra Wallet Node Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to sync with Blockchain nodes' });
  }
});

export default router;

