import User from '../models/User.js';
import { PLAN_DATA } from '../config/plans.js';
import axios from 'axios';

/**
 * 🔄 EXCHANGE BTC TO EUR
 * Allows users to convert their watched BTC deposits into EUR for plans
 */
export const exchangeBtcToEur = async (req, res) => {
  try {
    const { btcAmount } = req.body;
    const user = await User.findById(req.user.id);

    const userBtc = user.balances.get('BTC') || 0;
    if (userBtc < btcAmount) return res.status(400).json({ success: false, message: "Insufficient BTC" });

    // Fetch live price
    const priceRes = await axios.get('https://api.coingecko.com');
    const btcPrice = priceRes.data.bitcoin.eur;
    const eurValue = Number((btcAmount * btcPrice).toFixed(2));

    // Update Map Balances
    user.balances.set('BTC', Number((userBtc - btcAmount).toFixed(8)));
    user.balances.set('EUR', Number(((user.balances.get('EUR') || 0) + eurValue).toFixed(2)));

    user.ledger.push({
      amount: eurValue,
      currency: 'EUR',
      type: 'exchange',
      status: 'completed',
      description: `Exchanged ${btcAmount} BTC to EUR @ €${btcPrice}`
    });

    user.markModified('balances');
    await user.save();

    res.json({ success: true, message: "Exchange successful", balances: Object.fromEntries(user.balances) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🚀 ACTIVATE PLAN (User Self-Service)
 */
export const activatePlan = async (req, res) => {
  try {
    const { planKey, amount } = req.body;
    const plan = PLAN_DATA[planKey.toLowerCase()];

    if (!plan) return res.status(400).json({ message: 'Invalid plan selected' });
    if (amount < plan.min) return res.status(400).json({ message: `Minimum investment is ${plan.min} EUR` });

    const user = await User.findById(req.user.id);
    const currentEur = user.balances.get('EUR') || 0;

    if (currentEur < amount) return res.status(400).json({ message: 'Insufficient EUR balance' });

    // Deduct and Start ROI
    user.balances.set('EUR', Number((currentEur - amount).toFixed(2)));
    user.plan = planKey.toLowerCase();
    user.investedAmount = amount;
    user.dailyRoiRate = plan.dailyROI / 100; // Store as decimal for cron
    user.isPlanActive = true;
    user.planDaysServed = 0;
    user.lastProfitDate = new Date();

    user.ledger.push({
      amount: -amount,
      currency: 'EUR',
      type: 'investment',
      status: 'completed',
      description: `Activated ${plan.name} Plan`
    });

    user.markModified('balances');
    await user.save();

    res.json({ success: true, message: `${plan.name} activated!`, balances: Object.fromEntries(user.balances) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🛡️ ADMIN: GET ALL ACTIVE
 */
export const getActiveInvestments = async (req, res) => {
  try {
    const users = await User.find({ isPlanActive: true }).select('fullName email plan investedAmount');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

