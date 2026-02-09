// routes/deposit.js  (or wherever this lives)
import express from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const bip32 = BIP32Factory(ecc);

// Helper to get network
const getNetwork = () =>
  process.env.BTC_NETWORK === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

router.post('/:asset', protect, async (req, res) => {
  try {
    const { asset } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Reuse existing address if already generated for this asset
    if (user.depositAddresses && user.depositAddresses.get(asset.toUpperCase())) {
      return res.json({
        success: true,
        address: user.depositAddresses.get(asset.toUpperCase()),
      });
    }

    let address;
    const network = getNetwork();

    // Use incremental index stored per user (prevents collisions)
    const depositIndex = user.depositIndex || 0;
    user.depositIndex = depositIndex + 1; // increment for next time

    if (asset.toUpperCase() === 'BTC') {
      const XPUB = process.env.BITCOIN_XPUB;
      if (!XPUB) throw new Error('BITCOIN_XPUB is missing in environment');

      // BIP-84 native SegWit path: m/84'/0'/0'/0/index
      const node = bip32.fromBase58(XPUB, network);
      const child = node.derive(0).derive(depositIndex); // external chain (0), then index

      const { address: segwitAddress } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network,
      });

      address = segwitAddress;
    } else if (asset.toUpperCase() === 'ETH' || asset.toUpperCase() === 'USDT') {
      const mnemonic = process.env.ETH_MNEMONIC;
      if (!mnemonic) throw new Error('ETH_MNEMONIC is missing in environment');

      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      // BIP-44 for Ethereum: m/44'/60'/0'/0/index
      address = wallet.derivePath(`m/44'/60'/0'/0/${depositIndex}`).address;
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported asset' });
    }

    // Save to user
    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(asset.toUpperCase(), address);

    // Important for Mongoose Map changes
    user.markModified('depositAddresses');
    await user.save();

    res.json({
      success: true,
      address,
      asset: asset.toUpperCase(),
    });
  } catch (err) {
    console.error('[TRUSTRA_NODE_ERROR] Deposit address generation failed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate deposit address',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
