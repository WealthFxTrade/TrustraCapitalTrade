import express from 'express';
// ✅ FIX: Ensure this path matches your actual file (likely auth.js based on your file list)
import { protect } from '../middleware/auth.js'; 
import User from '../models/User.js';

const router = express.Router();

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9%', min: 100, max: 999, dailyRate: 0.003 },
  { id: 'basic', name: 'Rio Basic', roi: '9–12%', min: 1000, max: 4999, dailyRate: 0.004 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16%', min: 5000, max: 14999, dailyRate: 0.005 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20%', min: 15000, max: 49999, dailyRate: 0.006 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25%', min: 50000, max: Infinity, dailyRate: 0.008 },
];

/**
 * @route   GET /api/plans
 */
router.get('/', (req, res) => {                      
  res.status(200).json({
    success: true,
    plans: RIO_PLANS,
    data: RIO_PLANS // Included for frontend compatibility
  });
});

/**
 * @route   POST /api/plans/invest
 */
router.post('/invest', protect, async (req, res, next) => {
  try {
    const { planId, amount } = req.body;             
    const user = await User.findById(req.user._id); // ✅ FIX: Use req.user._id (standard Passport/JWT)

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const plan = RIO_PLANS.find(p => p.id === planId);                                                    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Invalid plan selected' });
    }

    // Validate investment amount
    const investAmount = Number(amount);
    if (investAmount < plan.min || (plan.max !== Infinity && investAmount > plan.max)) {
      return res.status(400).json({
        success: false,                              
        message: `Investment for ${plan.name} must be between €${plan.min} and ${plan.max === Infinity ? 'above' : '€' + plan.max}`
      });                                            
    }

    // Check user EUR balance
    const currentBalance = user.balances.get('EUR') || 0;                                                 
    if (currentBalance < investAmount) {                   
      return res.status(400).json({ success: false, message: 'Insufficient EUR balance' });
    }

    // Execute Transaction
    user.balances.set('EUR', currentBalance - investAmount);                                                                                                         

    // Update User Plan Status
    user.plan = plan.name;
    user.isPlanActive = true;

    // Add to Ledger
    user.ledger.push({
      amount: investAmount,                                
      currency: 'EUR',
      type: 'investment',                            
      status: 'completed',                           
      createdAt: new Date()                          
    });

    await user.save();

    res.status(200).json({
      success: true,                                 
      message: `Successfully invested €${investAmount} in ${plan.name}`,                                        
      user: {
        plan: user.plan,
        balance: user.balances.get('EUR')
      }
    });
  } catch (error) {                                  
    next(error); // ✅ FIX: Use the global error handler
  }
});

export default router;

