import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

// Import the controller functions
// Ensure these names match what you exported in userSupportController.js
import { 
    createTicket, 
    getMyTickets, 
    getTicketDetails 
} from '../controllers/userSupportController.js';

// ── SUPPORT PROTOCOLS ──

// POST /api/support/create
router.post('/create', protect, createTicket);

// GET /api/support/my-tickets
router.get('/my-tickets', protect, getMyTickets);

// GET /api/support/ticket/:id
router.get('/ticket/:id', protect, getTicketDetails);

export default router;
