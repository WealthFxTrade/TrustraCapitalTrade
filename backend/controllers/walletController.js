import HotWallet from '../models/HotWallet.js';
import BtcAddress from '../models/BtcAddress.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

/**
 * 🔥 UNIFIED DEPOSIT ADDRESS CONTROLLER
 * Supports: BTC (unique), ETH/USDT (shared hot wallet)
 *
 * GET /api/wallet/address?asset=BTC
 */
export const getDepositAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const asset = (req.query.asset || 'BTC').toUpperCase();
    const force = req.query.force === 'true';

    /**
     * ─────────────────────────────
     * 🟠 BTC (HD WALLET — UNIQUE PER USER)
     * ─────────────────────────────
     */
    if (asset === 'BTC') {
      if (!force) {
        const existing = await BtcAddress.findOne({ user: userId });

        if (existing) {
          return res.status(200).json({
            success: true,
            address: existing.address,
            network: 'Bitcoin',
            message: 'Existing BTC deposit address retrieved',
          });
        }
      }

      let hotWallet = await HotWallet.findOne({ currency: 'BTC' });

      if (!hotWallet) {
        hotWallet = await HotWallet.create({
          currency: 'BTC',
          balance: 0,
          lastIndex: 0,
        });
      }

      const nextIndex = (hotWallet.lastIndex || 0) + 1;

      // ⚠️ IMPORTANT: deriveBtcAddress should return { address }
      const derived = deriveBtcAddress(nextIndex);
      const newAddress = typeof derived === 'string' ? derived : derived.address;

      hotWallet.lastIndex = nextIndex;
      await hotWallet.save();

      await BtcAddress.findOneAndUpdate(
        { user: userId },
        {
          address: newAddress,
          index: nextIndex,
          updatedAt: Date.now(),
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        address: newAddress,
        network: 'Bitcoin',
        message: force
          ? 'New BTC deposit address generated (force)'
          : 'BTC deposit address ready',
      });
    }

    /**
     * ─────────────────────────────
     * 🔵 ETH (SHARED HOT WALLET)
     * ─────────────────────────────
     */
    if (asset === 'ETH') {
      if (!process.env.ETH_HOT_WALLET) {
        throw new Error('ETH_HOT_WALLET not configured');
      }

      return res.status(200).json({
        success: true,
        address: process.env.ETH_HOT_WALLET,
        network: 'Ethereum (ERC-20)',
        message: 'ETH deposit address ready',
      });
    }

    /**
     * ─────────────────────────────
     * 🟢 USDT (SHARED — NETWORK DEPENDENT)
     * ─────────────────────────────
     */
    if (asset === 'USDT') {
      if (!process.env.USDT_HOT_WALLET && !process.env.ETH_HOT_WALLET) {
        throw new Error('USDT wallet not configured');
      }

      return res.status(200).json({
        success: true,
        address: process.env.USDT_HOT_WALLET || process.env.ETH_HOT_WALLET,
        network: 'TRC20 / ERC20',
        message: 'USDT deposit address ready',
      });
    }

    /**
     * ─────────────────────────────
     * ❌ UNSUPPORTED ASSET
     * ─────────────────────────────
     */
    return res.status(400).json({
      success: false,
      message: 'Unsupported asset',
    });

  } catch (error) {
    console.error('[Wallet Controller Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to provide deposit address',
    });
  }
};
