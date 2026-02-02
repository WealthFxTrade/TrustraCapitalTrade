// backend/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Check this path!
const transactionRoutes = require('./routes/transactions');

const app = express();

// Enable CORS for your Vercel frontend
app.use(cors({
  origin: "https://trustra-capital-trade.vercel.app",
  credentials: true
}));

app.use(express.json());

// IMPORTANT: This maps your routes to the /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Optional: Add a root route to verify the API is alive
app.get('/', (req, res) => {
  res.send('Trustra Capital API is Running...');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

