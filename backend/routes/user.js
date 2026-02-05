router.get('/balance', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Check cache
    const cachedBalances = cache.get(userId);
    if (cachedBalances) {
      return res.json({ success: true, data: cachedBalances, source: 'cache' });
    }

    // 2. Fetch User
    const user = await User.findById(userId).select('balances');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    /**
     * 3. HARDENED ACCESS:
     * We check if user.balances exists and if it's a Map.
     * If not, we fall back to 0 to prevent the "Server Error".
     */
    const balances = {
      BTC: (user.balances instanceof Map ? user.balances.get('BTC') : user.balances?.BTC) ?? 0,
      USD: (user.balances instanceof Map ? user.balances.get('USD') : user.balances?.USD) ?? 0,
      USDT: (user.balances instanceof Map ? user.balances.get('USDT') : user.balances?.USDT) ?? 0
    };

    cache.set(userId, balances);
    res.json({ success: true, data: balances, source: 'db' });
  } catch (err) {
    // This logs the exact reason for the "Server Error" in Render
    console.error('CRITICAL_BALANCE_ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching balance' });
  }
});

