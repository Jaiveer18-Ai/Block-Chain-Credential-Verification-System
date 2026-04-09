const mongoose = require('mongoose');

const credentialMetaSchema = new mongoose.Schema({
    credentialId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    ipfsUrl: { type: String, required: true },
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRevoked: { type: Boolean, default: false },
}, { timestamps: true });

const CredentialMeta = mongoose.model('CredentialMeta', credentialMetaSchema);
module.exports = CredentialMeta;
