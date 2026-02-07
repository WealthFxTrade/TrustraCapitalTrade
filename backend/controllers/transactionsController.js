/**
 * @desc    Move funds from Profit Wallet to Main Wallet
 * @route   POST /api/transactions/reinvest
 */
export const reinvestFunds = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { amount } = req.body;
    const user = await User.findById(req.user.id).session(session);

    if (user.totalProfit < amount) {
      throw new Error("Insufficient funds in Profit Wallet");
    }

    // 1. Deduct from Profit
    user.totalProfit -= Number(amount);

    // 2. Credit Main Wallet
    const currentMain = user.balances.get('USD') || 0;
    user.balances.set('USD', currentMain + Number(amount));

    // 3. Log to Ledger
    user.ledger.push({
      amount: Number(amount),
      type: 'transfer',
      status: 'completed',
      description: 'Internal Transfer: Profit to Main Wallet'
    });

    await user.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: "Funds transferred to Main Wallet" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

