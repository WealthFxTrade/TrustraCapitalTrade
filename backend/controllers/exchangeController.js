import User from '../models/User.js';
import axios from 'axios';

export const exchangeBtcToEur = async (req, res) => {
  try {
    const { btcAmount } = req.body;
    const userId = req.user.id;

    if (!btcAmount || btcAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid BTC amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Investor node not found" });

    // Handle Mongoose Map correctly
    const userBtc = user.balances.get('BTC') || 0;

    if (userBtc < btcAmount) {
      return res.status(400).json({ message: "Insufficient BTC liquidity in node" });
    }

    // 1. Get Live Price (FIXED: Added correct CoinGecko Simple Price URL)
    const priceRes = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
    );
    
    const btcPrice = priceRes.data.bitcoin.eur;
    if (!btcPrice) throw new Error("Price oracle unreachable");

    const eurValue = Number((btcAmount * btcPrice).toFixed(2));

    // 2. Perform Swap with Floating Point Precision Fix
    const newBtcBalance = Number((userBtc - btcAmount).toFixed(8));
    const currentEur = user.balances.get('EUR') || 0;
    const newEurBalance = Number((currentEur + eurValue).toFixed(2));

    user.balances.set('BTC', newBtcBalance);
    user.balances.set('EUR', newEurBalance);
    
    // Sync totalBalance field if used for Dashboard cards
    user.totalBalance = newEurBalance; 

    // 3. Ledger Entry (Ensure your User schema includes 'ledger' as an Array)
    const transaction = {
      amount: eurValue,
      currency: 'EUR',
      type: 'exchange',
      status: 'completed',
      description: `Exchanged ${btcAmount} BTC at €${btcPrice.toLocaleString()}/BTC`,
      timestamp: new Date()
    };

    if (user.ledger) {
      user.ledger.push(transaction);
      user.markModified('ledger');
    }

    user.markModified('balances');
    await user.save();

    // 4. Real-time Socket Update
    const io = req.app.get('socketio');
    if (io) {
      io.to(userId.toString()).emit('balance_update', {
        balances: Object.fromEntries(user.balances),
        totalBalance: user.totalBalance
      });
    }

    res.status(200).json({
      success: true,
      message: `Exchange successful: +€${eurValue.toLocaleString()}`,
      data: {
        received: eurValue,
        rate: btcPrice,
        balances: Object.fromEntries(user.balances)
      }
    });

  } catch (error) {
    console.error(`[Exchange Error]: ${error.message}`);
    res.status(500).json({ message: "Exchange protocol failed: " + error.message });
  }
};
