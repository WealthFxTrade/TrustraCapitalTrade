import mongoose from 'mongoose';
import User from './models/User.js';
import { generateBitcoinAddress } from './utils/bitcoinUtils.js';

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🔗 Connected to DB for migration...");

        // 1. Find all duplicate btcAddress entries
        const duplicates = await User.aggregate([
            { $match: { btcAddress: { $exists: true, $ne: null } } },
            { $group: { 
                _id: "$btcAddress", 
                count: { $sum: 1 }, 
                userIds: { $push: "$_id" } 
            } },
            { $match: { count: { $gt: 1 } } }
        ]);

        console.log(`🔎 Found ${duplicates.length} duplicate address groups.`);

        for (const group of duplicates) {
            console.log(`⚠️  Address ${group._id} is shared by ${group.count} users.`);
            
            // Keep the address for the FIRST user, update others
            const [originalId, ...clashingIds] = group.userIds;

            for (const userId of clashingIds) {
                // Get a fresh unique index from the counter
                const counterDoc = await User.findOneAndUpdate(
                    { isCounter: true },
                    { $inc: { btcIndexCounter: 1 } },
                    { upsert: true, new: true }
                );

                const newIndex = counterDoc.btcIndexCounter;
                const newAddress = generateBitcoinAddress(process.env.BITCOIN_XPUB, newIndex);

                await User.findByIdAndUpdate(userId, {
                    btcAddress: newAddress,
                    btcIndex: newIndex
                });
                
                console.log(`✅ User ${userId} reassigned to unique address: ${newAddress}`);
            }
        }

        console.log("🏁 Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();

