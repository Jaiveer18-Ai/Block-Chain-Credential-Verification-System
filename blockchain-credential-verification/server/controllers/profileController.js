const User = require('../models/User');
const CredentialMeta = require('../models/CredentialMeta');
const bcrypt = require('bcryptjs');

// GET /api/profile — Full profile + credential stats
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compute credential stats based on role
        let credentialStats = {};

        if (user.role === 'student') {
            const allCreds = await CredentialMeta.find({ studentName: user.name });
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            credentialStats = {
                totalCredentials: allCreds.length,
                verifiedCredentials: allCreds.filter(c => !c.isRevoked).length,
                expiringSoon: allCreds.filter(c => {
                    if (!c.expiryDate || c.isRevoked) return false;
                    const expiry = new Date(c.expiryDate);
                    return expiry > now && expiry <= thirtyDaysFromNow;
                }).length,
            };
        } else if (user.role === 'institution') {
            const allCreds = await CredentialMeta.find({ issuedBy: user._id });

            credentialStats = {
                totalIssued: allCreds.length,
                activeCredentials: allCreds.filter(c => !c.isRevoked).length,
                revokedCredentials: allCreds.filter(c => c.isRevoked).length,
            };
        }

        res.status(200).json({
            profile: user,
            credentialStats,
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/profile — Update editable profile fields
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Only allow updating specific fields (never email, role, or password through this)
        const allowedFields = ['name', 'phone', 'dateOfBirth', 'bio', 'location'];
        
        if (user.role === 'institution') {
            allowedFields.push('institutionName', 'institutionType', 'website', 'registrationNumber');
        }

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                // Bio max length check
                if (field === 'bio' && req.body[field].length > 160) {
                    return res.status(400).json({ message: 'Bio must be 160 characters or less' });
                }
                user[field] = req.body[field];
            }
        }

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.status(200).json({ message: 'Profile updated successfully', profile: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/profile/avatar — Upload avatar as base64
const uploadAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ message: 'No avatar data provided' });

        // Basic size check (~2MB for base64)
        if (avatar.length > 2800000) {
            return res.status(400).json({ message: 'Image too large. Please use an image under 2MB.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.avatar = avatar;
        await user.save();

        res.status(200).json({ message: 'Avatar updated successfully', avatar: user.avatar });
    } catch (error) {
        console.error('Avatar Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/profile/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new passwords' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
};
