import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const adminExists = await User.findOne({ email: 'admin@trustra.com' });
  
  if (!adminExists) {
    await User.create({
      email: 'admin@trustra.com',
      password: 'Password123!',
      isAdmin: true,
      role: 'admin'
    });
    console.log('✅ Admin Created: admin@trustra.com / Password123!');
  } else {
    console.log('ℹ️ Admin already exists');
  }
  process.exit();
};

createAdmin();
