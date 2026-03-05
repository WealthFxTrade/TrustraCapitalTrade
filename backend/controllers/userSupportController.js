import SupportTicket from '../models/SupportTicket.js';
import { ApiError } from '../middleware/errorMiddleware.js';

// @desc    Fetch all tickets for the logged-in user
// @route   GET /api/support/my-tickets
export const getMyTickets = async (req, res, next) => {
    try {
        // req.user.id comes from the 'protect' middleware
        const tickets = await SupportTicket.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new support request
export const createTicket = async (req, res, next) => {
    try {
        const { subject, message, priority } = req.body;
        
        const ticket = await SupportTicket.create({
            user: req.user.id,
            subject,
            message,
            priority: priority || 'medium'
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single ticket details
export const getTicketDetails = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!ticket) throw new ApiError(404, 'Ticket not found');

        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        next(err);
    }
};
