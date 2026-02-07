import express from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers } from 'ethers';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js'; 

const router = express.Router();
const bip32 = BIP32Factory(ecc);

// Use /:asset to match the Frontend call: /api/wallet/BTC
router.post('/:asset', protect, async (req, res) => {
  try {
    const { asset } = req.params;
    const userId = req.user._id; 
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Return existing address if available
    if (user.depositAddresses?.get(asset)) {
      return res.json({ success: true, address: user.depositAddresses.get(asset) });
    }

    let address;
    const index = parseInt(userId.toString().slice(-6), 16) || 0;

    if (asset === 'BTC') {
      const node = bip32.fromBase58(process.env.BITCOIN_XPUB);
      const child = node.derive(0).derive(index);
      address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey }).address;
    } else if (asset === 'ETH' || asset === 'USDT') {
      const wallet = ethers.HDNodeWallet.fromPhrase(process.env.ETH_MNEMONIC);
      address = wallet.deriveChild(index).address;
    }

    if (!user.depositAddresses) user.depositAddresses = new Map();
    user.depositAddresses.set(asset, address);
    user.markModified('depositAddresses'); 
    await user.save();

    res.json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Blockchain Node Sync Failed' });
  }
});

export default router;

