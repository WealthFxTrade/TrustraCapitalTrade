import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

const fixUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Replace with YOUR email
  const email = "gery.maes1@telenet.be"; 

  const update = {
    $set: {
      "balances": new Map([["USD", 115500], ["BTC", 0], ["USDT", 0]]),
      "plan": "Rio Standard",
      "isPlanActive": true
    },
    $push: {
      "ledger": {
        amount: 115500,
        currency: "USD",
        type: "deposit",
        status: "completed",
        description: "Initial account funding",
        createdAt: new Date()
      }
    }
  };

  await User.findOneAndUpdate({ email }, update, { new: true });
  console.log("✅ User account funded with $115,500 and Ledger updated!");
  process.exit();
};

fixUser();

