import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

// -----------------------------
// CORS: allow only your frontend
// -----------------------------
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app', // your live frontend
  'http://localhost:3000'                     // local testing
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser requests (Postman, server-to-server)
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies if needed
}));

// -----------------------------
// JSON body parser
// -----------------------------
app.use(express.json());

// -----------------------------
// Routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TrustraCapitalTrade Backend is running!' });
});

// -----------------------------
// MongoDB connection
// -----------------------------
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/trustracapital';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
