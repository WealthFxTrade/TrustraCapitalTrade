import mongoose from 'mongoose';

export const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected');
      console.log('Database:', mongoose.connection.name);
      return;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
};
