router.get('/balance', protect, async (req, res) => {
  try {
    // 1. Double-check User ID exists from middleware
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      console.error('AUTH_ERROR: No User ID found in request object');
      return res.status(401).json({ success: false, message: 'User not authenticated properly' });
    }

    const cacheKey = `balance_${userId}`;

    // 2. Check cache
    const cachedBalances = cache.get(cacheKey);
    if (cachedBalances) {
      return res.json({ success: true, data: cachedBalances, source: 'cache' });
    }

    // 3. Fetch User with lean() for faster performance
    const user = await User.findById(userId).select('balances').lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    /**
     * 4. 2026 MAP FIX:
     * Since we used lean(), the Map might behave like a standard object.
     * We handle both cases to be 100% safe.
     */
    const b = user.balances || {};
    const balances = {
      BTC: (b instanceof Map ? b.get('BTC') : b.BTC) ?? 0,
      USD: (b instanceof Map ? b.get('USD') : b.USD) ?? 0,
      USDT: (b instanceof Map ? b.get('USDT') : b.USDT) ?? 0
    };

    // 5. Cache and return
    cache.set(cacheKey, balances);
    res.json({ success: true, data: balances, source: 'db' });

  } catch (err) {
    console.error('CRITICAL_BALANCE_ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching balance' });
  }
});

