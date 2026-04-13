const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['institution', 'student', 'admin'], default: 'student', required: true },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    institutionName: { type: String, required: function() { return this.role === 'institution'; } },
    walletAddress: { type: String },

    // Profile fields (optional)
    phone: { type: String },
    dateOfBirth: { type: Date },
    bio: { type: String, maxlength: 160 },
    location: { type: String },
    avatar: { type: String }, // base64 data URL

    // Institution-specific profile fields
    institutionType: { type: String, enum: ['University', 'College', 'School', 'Training Center', 'Organization', ''] },
    website: { type: String },
    registrationNumber: { type: String },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
