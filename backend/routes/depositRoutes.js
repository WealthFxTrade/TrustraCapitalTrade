import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
// Add your specific controller imports here, for example:
// import { getDeposits, createDeposit } from '../controllers/depositController.js';

const router = express.Router();

// Example of how the routes should look now:
// router.get('/', protect, getDeposits);
// router.post('/admin-action', protect, admin, createDeposit);

export default router;
