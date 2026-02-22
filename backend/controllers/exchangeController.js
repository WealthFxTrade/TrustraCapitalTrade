import User from '../models/User.js';
import axios from 'axios';

export const exchangeBtcToEur = async (req, res) => {
  try {
    const { btcAmount } = req.body;
    const userId = req.user.id;

    if (!btcAmount || btcAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(userId);
    const userBtc = user.balances.get('BTC') || 0;

    if (userBtc < btcAmount) {
      return res.status(400).json({ message: "Insufficient BTC balance" });
    }

    // 1. Get Live Price
    const priceRes = await axios.get('https://api.coingecko.com');
    const btcPrice = priceRes.data.bitcoin.eur;
    const eurValue = Number((btcAmount * btcPrice).toFixed(2));

    // 2. Perform Swap
    user.balances.set('BTC', Number((userBtc - btcAmount).toFixed(8)));
    const currentEur = user.balances.get('EUR') || 0;
    user.balances.set('EUR', currentEur + eurValue);

    // 3. Ledger Entry
    user.ledger.push({
      amount: eurValue,
      currency: 'EUR',
      type: 'exchange',
      status: 'completed',
      description: `Exchanged ${btcAmount} BTC to EUR`
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    // 4. Real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(userId).emit('balance_update', { 
        balances: Object.fromEntries(user.balances) 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Successfully exchanged ${btcAmount} BTC for €${eurValue}`,
      balances: user.balances 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

