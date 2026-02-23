import HotWallet from '../models/HotWallet.js';
import BtcAddress from '../models/BtcAddress.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

export const getBtcAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { force } = req.query;

    if (force !== 'true') {
      const existing = await BtcAddress.findOne({ user: userId });
      if (existing) return res.json({ address: existing.address });
    }

    let hotWallet = await HotWallet.findOne({});
    if (!hotWallet) {
      hotWallet = await HotWallet.create({ currency: 'BTC', balance: 0, lastIndex: 0 });
    }

    const nextIndex = (hotWallet.lastIndex || 0) + 1;
    const newAddress = deriveBtcAddress(nextIndex);

    hotWallet.lastIndex = nextIndex;
    await hotWallet.save();

    await BtcAddress.findOneAndUpdate(
      { user: userId },
      { address: newAddress, index: nextIndex },
      { upsert: true, new: true }
    );

    res.json({ address: newAddress });
  } catch (error) {
    console.error('[Controller Error]:', error.message);
    res.status(500).json({ error: 'Failed to provide BTC address' });
  }
};

