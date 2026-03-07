import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      
      console.log(`📡 Database Handshake Successful: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      attempt++;
      console.error(`❌ MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);
      if (attempt === maxRetries) {
        console.error('CRITICAL: Database connection limit reached. Manual intervention required.');
        process.exit(1);
      }
      // Wait before retrying (exponential backoff)
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
};

export default connectDB;
