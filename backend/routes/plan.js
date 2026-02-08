import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';                
const router = express.Router();                     

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999, dailyRate: 0.003 }, 
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999, dailyRate: 0.004 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999, dailyRate: 0.005 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999, dailyRate: 0.006 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity, dailyRate: 0.008 },
];

/**
 * @route   GET /api/plans
 */
router.get('/', (req, res) => {                        
  res.status(200).json({
    success: true,
    plans: RIO_PLANS,
    data: RIO_PLANS
  });
});

/**
 * @route   POST /api/plans/invest
 * @desc    Invest in a Rio plan using EUR
 */
router.post('/invest', protect, async (req, res) => {
  try {
    const { planId, amount } = req.body;                 
    const user = await User.findById(req.user.id);   
    
    const plan = RIO_PLANS.find(p => p.id === planId);                                                        
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Invalid plan selected' });
    }

    // 1. Validate investment amount (changed $ to € in message)
    if (amount < plan.min || (plan.max !== Infinity && amount > plan.max)) {
      return res.status(400).json({
        success: false,                                      
        message: `Investment for ${plan.name} must be between €${plan.min} and €${plan.max}`
      });                                                
    }                                                
    
    // 2. Check user EUR balance (changed from 'USD' to 'EUR')
    const currentBalance = user.balances.get('EUR') || 0;                                                     
    if (currentBalance < amount) {                         
      return res.status(400).json({ success: false, message: 'Insufficient EUR balance' });
    }

    // 3. Execute Transaction
    // Deduct EUR balance
    user.balances.set('EUR', currentBalance - amount);                                                                                                             

    // Update User Plan Status
    user.plan = plan.name;
    user.isPlanActive = true;

    // 4. Add to Ledger (changed currency to 'EUR')
    user.ledger.push({
      amount: amount,                                      
      currency: 'EUR',
      type: 'investment',                                  
      status: 'completed',                                 
      createdAt: new Date()                              
    });

    await user.save();                               

    res.status(200).json({
      success: true,                                       
      message: `Successfully invested €${amount} in ${plan.name}`,                                              
      user: {
        plan: user.plan,
        balance: user.balances.get('EUR')
      }
    });
  } catch (error) {                                      
    res.status(500).json({ success: false, message: error.message });
  }                                                  
});

export default router;

