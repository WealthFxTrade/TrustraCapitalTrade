import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import userRoutes from './routes/user.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['https://trustra-capital-trade.vercel.app', 'http://localhost:5173'];
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Blocked'));
    }
  },
  credentials: true
}));

app.get('/', (req, res) => res.json({ success: true, message: "Trustra 2026 API Active" }));

// DUAL MOUNTING: Fixes all "Route not found" errors
app.use('/api/user', userRoutes); 
app.use('/api', userRoutes); 

app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

app.use(errorHandler);

export default app;

