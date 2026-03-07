// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        // Recommended options for Mongoose 6+ / 7+
        serverSelectionTimeoutMS: 5000,      // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000,              // Close sockets after 45s inactivity
        family: 4,                           // Use IPv4, skip trying IPv6
        // heartbeatFrequencyMS: 10000,      // optional
      });

      console.log(`📡 MongoDB connected successfully: ${conn.connection.host}`);
      console.log(`   Database name: ${conn.connection.name}`);
      console.log(`   Ready state: ${conn.connection.readyState}`);

      // Optional: listen for connection events
      mongoose.connection.on('connected', () => {
        console.log('MongoDB event: connected');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB event: error', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB event: disconnected - attempting reconnect...');
      });

      return conn;
    } catch (err) {
      attempt++;
      console.error(`❌ MongoDB connection attempt \( {attempt}/ \){maxRetries} failed:`, err.message);

      if (attempt === maxRetries) {
        console.error('CRITICAL: Max retries reached. Cannot connect to MongoDB.');
        console.error('Please check:');
        console.error('  • MONGO_URI in .env');
        console.error('  • Network / IP whitelist in MongoDB Atlas');
        console.error('  • MongoDB Atlas cluster is running');
        process.exit(1);
      }

      // Exponential backoff: 2s → 4s → 8s → 16s → 32s
      const delay = Math.min(1000 * 2 ** attempt, 30000); // cap at 30s
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
