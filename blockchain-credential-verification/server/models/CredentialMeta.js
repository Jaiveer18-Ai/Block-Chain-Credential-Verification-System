const mongoose = require('mongoose');

const credentialMetaSchema = new mongoose.Schema({
    credentialId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentId: { type: String, required: true },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    ipfsUrl: { type: String, required: true },
    originalDocumentHash: { type: String },
    originalMimeType: { type: String },
    originalFileName: { type: String },
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number },
    expiryDate: { type: Date },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRevoked: { type: Boolean, default: false },
    baselineAnalysis: {
        ocrEngine: String,
        ocrConfidence: Number,
        parsedFields: mongoose.Schema.Types.Mixed,
        signatureFingerprint: mongoose.Schema.Types.Mixed,
        metadata: mongoose.Schema.Types.Mixed,
        warnings: [String],
        analyzedAt: Date,
    },
}, { timestamps: true });

const CredentialMeta = mongoose.model('CredentialMeta', credentialMetaSchema);
module.exports = CredentialMeta;
