import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log("🔌 Attempting to connect to MongoDB...");
  
  try {
    // Attempt connection using URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("✅ MongoDB Connection Successful!");
    console.log(`📂 Database Name: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    
    // Close connection after successful test
    await mongoose.connection.close();
    console.log("OK: Connection closed safely.");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error(`Error Message: ${error.message}`);
    
    // Common troubleshooting tips
    if (error.message.includes("IP not whitelisted")) {
      console.log("👉 Suggestion: Add your current IP to the whitelist in MongoDB Atlas.");
    }
    process.exit(1);
  }
};

testConnection();

