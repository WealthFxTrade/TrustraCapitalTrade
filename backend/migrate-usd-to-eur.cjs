// migrate-usd-to-eur.cjs
require('dotenv').config();
const mongoose = require('mongoose');

// 1. Import the schema & define the model explicitly here
const userSchema = require('./models/User').schema; // or copy-paste the schema if you prefer
const User = mongoose.model('User', userSchema);    // Register model manually

async function migrateBalances() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');

    // Find users with USD balance
    const users = await User.find({ 'balances.USD': { $exists: true } });

    console.log(`Found ${users.length} users with USD balance to migrate`);

    let updatedCount = 0;

    for (const user of users) {
      const usdValue = user.balances.get('USD') ?? 0;

      if (usdValue !== undefined) {
        // Move value to EUR
        user.balances.set('EUR', usdValue);
        // Remove old USD key
        user.balances.delete('USD');

        // Tell Mongoose the Map changed
        user.markModified('balances');

        await user.save();
        updatedCount++;
        console.log(`Updated user \( {user._id}: USD \){usdValue} → EUR ${usdValue}`);
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} users.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute
migrateBalances();
