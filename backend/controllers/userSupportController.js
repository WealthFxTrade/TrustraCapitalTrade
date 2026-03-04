import SupportTicket from '../models/SupportTicket.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Submit a new support inquiry
 * @route   POST /api/support/tickets
 * @access  Private
 */
export const createTicket = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;

    if (!subject || !message) {
      throw new ApiError(400, "Protocol Violation: Subject and Message body required.");
    }

    // Create the ticket with the first message in the thread
    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      category,
      status: 'open',
      messages: [{
        sender: req.user._id,
        text: message
      }]
    });

    res.status(201).json({
      success: true,
      message: "Query logged in global support ledger.",
      ticket
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all tickets belonging to the authenticated user
 * @route   GET /api/support/my-tickets
 * @access  Private
 */
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (err) {
    next(err);
  }
};
