import express from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const bip32 = BIP32Factory(ecc);

router.post('/generate/:asset', protect, async (req, res) => {
  try {
    const { asset } = req.params;
    const userId = req.user._id.toString();

    if (!['BTC', 'ETH', 'USDT'].includes(asset)) {
      return res.status(400).json({ success: false, message: 'Unsupported asset' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Return existing address if already generated
    if (user.depositAddresses && user.depositAddresses.get(asset)) {
      return res.json({ success: true, address: user.depositAddresses.get(asset) });
    }

    let address;
    // 2. Generate a deterministic index (0 to 2,147,483,647)
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const index = parseInt(hash.slice(0, 7), 16); 

    if (asset === 'BTC') {
      const XPUB = process.env.BITCOIN_XPUB;
      if (!XPUB) throw new Error("BITCOIN_XPUB missing");

      const network = bitcoin.networks.bitcoin;
      const node = bip32.fromBase58(XPUB, network);
      const child = node.derive(0).derive(index);
      address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network }).address;

    } else {
      // ETH and USDT (ERC-20) share the same Ethereum address
      const mnemonic = process.env.ETH_MNEMONIC;
      if (!mnemonic) throw new Error("ETH_MNEMONIC missing");

      const masterNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      address = masterNode.derivePath(`m/44'/60'/0'/0/${index}`).address;
    }

    // 3. Save to Mongoose Map
    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(asset, address);
    
    user.markModified('depositAddresses'); 
    await user.save();

    res.json({ success: true, address });
  } catch (error) {
    console.error(`[Wallet Creation Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;

