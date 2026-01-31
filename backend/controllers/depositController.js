import Deposit from '../models/Deposit.js';
import { confirmDeposit } from '../services/confirmDeposit.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';

export async function createDeposit(req, res) {
  const { amount, method, currency, address, txHash } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const deposit = await Deposit.create({
      user: userId,
      currency,
      address,
      expectedAmount: amount,
      status: 'pending',
      txHash,
      method,
    });

    res.json({ success: true, message: 'Deposit created', deposit });
  } catch (err) {
    console.error('[createDeposit ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to create deposit' });
  }
}

export async function getUserDeposits(req, res) {
  try {
    const deposits = await Deposit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, deposits });
  } catch (err) {
    console.error('[getUserDeposits ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch deposits' });
  }
}

export async function getDepositHistory(req, res) {
  return getUserDeposits(req, res);
}

export async function getAllDeposits(req, res) {
  try {
    const deposits = await Deposit.find().sort({ createdAt: -1 });
    res.json({ success: true, deposits });
  } catch (err) {
    console.error('[getAllDeposits ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch all deposits' });
  }
}

export async function manualConfirmDeposit(req, res) {
  const { depositId } = req.params;
  try {
    await confirmDeposit(depositId);
    res.json({ success: true, message: 'Deposit confirmed' });
  } catch (err) {
    console.error(`[manualConfirmDeposit ERROR] Deposit ID: ${depositId}`, err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOrCreateBtcDepositAddressController(req, res) {
  try {
    const userId = req.user._id;
    const fresh = req.query.fresh === 'true';
    const address = await getOrCreateBtcDepositAddress(userId, fresh);
    res.json({ success: true, address });
  } catch (err) {
    console.error('[getOrCreateBtcDepositAddressController ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to get BTC deposit address' });
  }
}
