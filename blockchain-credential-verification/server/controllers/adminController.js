const User = require('../models/User');
const CredentialMeta = require('../models/CredentialMeta');
const bcrypt = require('bcryptjs');

/**
 * Get overall system statistics for the admin dashboard.
 */
const getStats = async (req, res) => {
    try {
        const timeout = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ 
            isOnline: true,
            lastActive: { $gte: timeout }
        });
        const totalInstitutions = await User.countDocuments({ role: 'institution' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        const totalCredentials = await CredentialMeta.countDocuments();
        const revokedCredentials = await CredentialMeta.countDocuments({ isRevoked: true });

        res.status(200).json({
            totalUsers,
            activeUsers,
            totalInstitutions,
            totalStudents,
            totalCredentials,
            revokedCredentials
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all users (institutions and students).
 */
const getAllUsers = async (req, res) => {
    try {
        const timeout = new Date(Date.now() - 2 * 60 * 1000);
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        
        // Dynamically update isOnline based on timeout for the response
        const processedUsers = users.map(user => {
            const userObj = user.toObject();
            userObj.isOnline = user.isOnline && user.lastActive >= timeout;
            return userObj;
        });

        res.status(200).json(processedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all credentials in the system.
 */
const getAllCredentials = async (req, res) => {
    try {
        const credentials = await CredentialMeta.find().sort({ createdAt: -1 });
        res.status(200).json(credentials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a credential from the database (admin only).
 */
const deleteCredential = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CredentialMeta.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ message: 'Credential record not found' });
        }
        
        res.status(200).json({ message: 'Credential record successfully removed from system' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new administrator account.
 */
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        res.status(201).json({
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * List all current administrators.
 */
const getAllAdmins = async (req, res) => {
    try {
        const timeout = new Date(Date.now() - 2 * 60 * 1000);
        const admins = await User.find({ role: 'admin' }).select('-password');
        
        const processedAdmins = admins.map(admin => {
            const adminObj = admin.toObject();
            adminObj.isOnline = admin.isOnline && admin.lastActive >= timeout;
            return adminObj;
        });

        res.status(200).json(processedAdmins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Helper: Setup the first admin if none exist.
 */
const setupFirstAdmin = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Admins already exist. Use the admin panel to create more.' });
        }

        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        res.status(201).json({ message: 'First admin created successfully', admin: { name: admin.name, email: admin.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update user status (e.g., ban/unban).
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'banned'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Administrators cannot be banned via this protocol' });
        }

        user.status = status;
        await user.save();

        res.status(200).json({ message: `User account has been ${status === 'active' ? 'activated' : 'restricted'} successfully`, status: user.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Permanently delete a user from the system.
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Delete Request - UserID: ${id}, Admin: ${req.user.email}`);

        const user = await User.findById(id);
        if (!user) {
            console.log(`[DEBUG] Delete Failed: User ${id} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[DEBUG] Found User: ${user.email}, Role: ${user.role}`);

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Administrators cannot be deleted from the directory' });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User permanent node deletion successful' });
    } catch (error) {
        console.error('CRITICAL: User Deletion Protocol Failed:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    getAllCredentials,
    deleteCredential,
    createAdmin,
    getAllAdmins,
    setupFirstAdmin,
    updateUserStatus,
    deleteUser
};
