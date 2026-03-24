// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Best options for Termux / unstable mobile networks
      family: 4,                        // Force IPv4
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State: connected`);

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(`   Error: ${error.message}`);

    if (error.name === 'MongoServerSelectionError') {
      console.error('   → Possible causes: DNS issue, no internet, wrong MONGO_URI, or Atlas IP whitelist');
      console.error('   → Quick fixes:');
      console.error('     1. Check internet: ping 8.8.8.8');
      console.error('     2. nslookup ac-kfwhzy7-shard-00-01.w2mghdv.mongodb.net');
      console.error('     3. In MongoDB Atlas → Network Access → Add Current IP or allow 0.0.0.0/0');
    }
    process.exit(1);
  }
};

export default connectDB;
