const mongoose = require('mongoose');

const fraudAnalysisReportSchema = new mongoose.Schema({
    credentialId: { type: String, required: true, index: true },
    credential: { type: mongoose.Schema.Types.ObjectId, ref: 'CredentialMeta' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    uploadedFile: {
        originalName: String,
        mimeType: String,
        size: Number,
        sha256: { type: String, index: true },
    },

    blockchain: {
        checked: { type: Boolean, default: false },
        isValid: Boolean,
        chainCredentialId: String,
        chainIpfsHash: String,
        isRevoked: Boolean,
        issuedBy: String,
        error: String,
    },

    ocr: {
        engine: String,
        text: String,
        confidence: Number,
        parsedFields: mongoose.Schema.Types.Mixed,
        warnings: [String],
    },

    metadataValidation: mongoose.Schema.Types.Mixed,
    hashValidation: mongoose.Schema.Types.Mixed,
    pdfTampering: mongoose.Schema.Types.Mixed,
    imageForensics: mongoose.Schema.Types.Mixed,
    signatureValidation: mongoose.Schema.Types.Mixed,

    score: {
        authenticityScore: { type: Number, required: true },
        tamperingProbability: { type: Number, required: true },
        tamperingRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
        trustLevel: { type: String, enum: ['VERY_HIGH', 'HIGH', 'MODERATE', 'LOW', 'UNTRUSTED'], required: true },
        verificationStatus: { type: String, enum: ['AUTHENTIC', 'REVIEW_REQUIRED', 'SUSPICIOUS', 'LIKELY_FRAUD'], required: true },
        confidence: { type: Number, default: 0 },
    },

    alerts: [{
        severity: { type: String, enum: ['info', 'low', 'medium', 'high', 'critical'], default: 'info' },
        code: String,
        message: String,
        evidence: mongoose.Schema.Types.Mixed,
    }],

    processing: {
        durationMs: Number,
        pipelineVersion: { type: String, default: 'fraud-ai-v1' },
    },

    requestMeta: {
        ip: String,
        userAgent: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('FraudAnalysisReport', fraudAnalysisReportSchema);
