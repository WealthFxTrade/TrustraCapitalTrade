import mongoose from 'mongoose';
import 'dotenv/config';
import Plan from './models/Plan.js';

const plans = [
  { name: 'Rio Starter', minDeposit: 100, maxDeposit: 999, roi: 9 },
  { name: 'Rio Basic', minDeposit: 1000, maxDeposit: 4999, roi: 12 },
  { name: 'Rio Standard', minDeposit: 5000, maxDeposit: 14999, roi: 16 },
  { name: 'Rio Advanced', minDeposit: 15000, maxDeposit: 49999, roi: 20 },
  { name: 'Rio Elite', minDeposit: 50000, maxDeposit: 1000000, roi: 25 },
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log('✅ Rio Investment Plans Seeded');
  process.exit();
};

seedDB();

