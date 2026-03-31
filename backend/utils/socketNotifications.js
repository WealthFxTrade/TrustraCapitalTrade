// utils/socketNotifications.js - Zurich Alert System
import { getIO } from '../socket.js'; // Points to the new manager

/**
 * Send real-time notification to a specific user
 * @param {string} userId - The user's MongoDB ID
 * @param {string} eventName - Event name (e.g. 'deposit_confirmed')
 * @param {object} data - Data payload
 */
export const sendNotificationToUser = (userId, eventName, data) => {
  try {
    const io = getIO();
    if (io && userId) {
      io.to(userId.toString()).emit(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`[REAL-TIME] Event '${eventName}' dispatched to Node: ${userId}`);
    }
  } catch (error) {
    console.warn(`[SOCKET ERROR] Notification suppressed: ${error.message}`);
  }
};

/**
 * Broadcast notification to all connected admin nodes
 */
export const broadcastToAdmins = (eventName, data) => {
  try {
    const io = getIO();
    if (io) {
      // Admins should be joined to an 'admins' room for security
      io.to('admins').emit(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`[BROADCAST ERROR] Admin sync failed: ${error.message}`);
  }
};
