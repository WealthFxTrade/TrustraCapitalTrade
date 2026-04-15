import cron from 'node-cron';
import mongoose from 'mongoose';
import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const startRoiEngine = (io) => {
    // Run Daily at Midnight
    cron.schedule('0 0 * * *', async () => {
        const sessionDate = new Date().toISOString().split('T')[0];
        console.log(`🌘 [ROI ENGINE] EXECUTING SETTLEMENT: ${sessionDate}`);

        const activePlans = await Investment.find({ status: 'active' });
        if (activePlans.length === 0) return console.log('📡 No active nodes found.');

        for (const plan of activePlans) {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                // 1. Double Payout Guard
                const alreadyProcessed = await Transaction.findOne({
                    user: plan.user,
                    type: 'yield',
                    description: new RegExp(plan.planName),
                    createdAt: { $gte: new Date(sessionDate) }
                }).session(session);

                if (alreadyProcessed) {
                    await session.abortTransaction();
                    continue;
                }

                // 2. Calculate Yield
                let dailyProfit = (plan.amount * plan.dailyRoi) / 100;
                
                // Specific User Override Logic
                const user = await User.findById(plan.user).session(session);
                if (user && user.email === 'gery.maes1@telenet.be' && plan.amount === 110000) {
                    dailyProfit = 12.50;
                }

                // 3. Update User & Create Transaction
                const currentROI = user.balances.get('ROI') || 0;
                user.balances.set('ROI', Number((currentROI + dailyProfit).toFixed(2)));
                
                await Transaction.create([{
                    user: user._id,
                    type: 'yield',
                    amount: dailyProfit,
                    currency: 'EUR',
                    status: 'completed',
                    description: `Alpha Settlement: ${plan.planName}`,
                    txHash: `YIELD-${plan._id.toString().slice(-4)}-${sessionDate}`
                }], { session });

                // 4. Handle Maturity
                plan.totalReturn += dailyProfit;
                plan.lastRoiAt = new Date();
                if (new Date() >= plan.endsAt) {
                    plan.status = 'completed';
                    // Return capital to main balance
                    const mainBal = user.balances.get('EUR') || 0;
                    user.balances.set('EUR', mainBal + plan.amount);
                }

                user.markModified('balances');
                await user.save({ session });
                await plan.save({ session });

                await session.commitTransaction();

                // 5. Real-time Notification
                if (io) {
                    io.to(user._id.toString()).emit('balanceUpdate', {
                        balances: Object.fromEntries(user.balances),
                        message: `📈 +€${dailyProfit.toFixed(2)} Yield Distributed`
                    });
                }
            } catch (err) {
                await session.abortTransaction();
                console.error(`❌ [ROI ERROR] ${plan._id}:`, err.message);
            } finally {
                session.endSession();
            }
        }
        console.log(`--- [ROI ENGINE] Settlement Complete ---`);
    });
};
