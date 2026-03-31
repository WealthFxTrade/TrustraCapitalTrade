// backend/utils/rioEngine.js
import cron from 'node-cron';
import User from '../models/User.js';

/**
 * 2026 ALPHA PROTOCOL - ANNUALIZED TO DAILY RATES
 * Calculated as: (Annual % / 100) / 365
 * Matches Landing.jsx Strategic Tiers
 */
const RIO_DAILY_RATES = {
  'Tier I: Entry': 0.00020,         // ~7.5% Avg Annual
  'Tier II: Core': 0.00028,         // ~10.5% Avg Annual
  'Tier III: Prime': 0.00038,        // ~14.0% Avg Annual
  'Tier IV: Institutional': 0.00049, // ~18.0% Avg Annual
  'Tier V: Sovereign': 0.00061,      // ~22.5% Avg Annual
  'Rio Elite': 0.00061,              // Legacy Match for Gery Maes (22.5%)
  'Elite': 0.00061                   // Alias Match
};

export const runYieldDistribution = async (io) => {
  console.log('🌘 [RIO ENGINE] EXECUTING 2026 ALPHA SETTLEMENT...');

  try {
    // Only fetch nodes that are active and not banned
    const activeNodes = await User.find({ 
      isActive: true, 
      isNodeActive: true,
      isBanned: false 
    });

    console.log(`📡 Processing ${activeNodes.length} Active Nodes...`);

    for (let node of activeNodes) {
      // 1. Determine Rate based on Plan
      const plan = node.activePlan || 'Tier I: Entry';
      const rate = RIO_DAILY_RATES[plan] || RIO_DAILY_RATES['Tier I: Entry'];
      
      // 2. Calculate Yield based on Invested Capital (or EUR Balance)
      const principal = node.balances.get('INVESTED') || node.balances.get('EUR') || 0;
      
      const dailyYield = Number((principal * rate).toFixed(2));
      if (dailyYield <= 0) continue;

      // 3. Update ROI and Total Balances
      const currentROI = Number(node.balances.get('ROI') || 0);
      const currentTotal = Number(node.totalBalance || 0);
      const currentProfit = Number(node.totalProfit || 0);

      node.balances.set('ROI', Number((currentROI + dailyYield).toFixed(2)));
      node.totalBalance = Number((currentTotal + dailyYield).toFixed(2));
      node.totalProfit = Number((currentProfit + dailyYield).toFixed(2));

      // 4. Update Ledger
      if (!node.ledger) node.ledger = []; // Safety check
      node.ledger.push({
        amount: dailyYield,
        type: 'yield',
        description: `Alpha Settlement: ${plan} Node Distribution`,
        createdAt: new Date()
      });

      // 5. Persist Changes
      node.markModified('balances');
      await node.save();

      // 6. Real-time Socket Update
      if (io) {
        io.to(node._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(node.balances),
          totalBalance: node.totalBalance,
          totalProfit: node.totalProfit,
          message: `+€${dailyYield.toLocaleString()} Alpha Yield Distributed`
        });
      }
    }
    
    console.log('✅ [RIO ENGINE] Alpha Settlement Complete.');
  } catch (err) {
    console.error('❌ [RIO ENGINE ERROR]', err.message);
  }
};

/**
 * @desc Initialize the Cron Schedule (Daily at Midnight)
 */
export const initRioEngine = (io) => {
  console.log('⚙️ [RIO ENGINE] Alpha Protocol Synchronized');
  
  // Schedule: Every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', () => {
    runYieldDistribution(io);
  });
};

