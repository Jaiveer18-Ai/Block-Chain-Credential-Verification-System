const User = require('../models/User');

/**
 * Middleware to update the user's lastActive timestamp and ensure isOnline is true.
 */
const updateUserStatus = async (req, res, next) => {
    if (req.user && req.user._id) {
        try {
            await User.findByIdAndUpdate(req.user._id, {
                lastActive: new Date(),
                isOnline: true
            });
        } catch (error) {
            console.error('Error updating user status:', error.message);
        }
    }
    next();
};

module.exports = updateUserStatus;
