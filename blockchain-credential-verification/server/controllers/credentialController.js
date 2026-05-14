const CredentialMeta = require('../models/CredentialMeta');
const { uploadToIPFS } = require('../utils/ipfsUpload');
const { issueCredentialOnChain, revokeCredentialOnChain } = require('../utils/blockchain');
const { sendCredentialNotification } = require('../utils/emailService');
const { buildCredentialBaseline } = require('../services/fraud/fraudDetectionService');
const { sha256Buffer } = require('../services/fraud/hashService');
const crypto = require('crypto');

const extensionFromName = (fileName = '') => {
    const index = fileName.lastIndexOf('.');
    return index >= 0 ? fileName.slice(index).toLowerCase() : '.pdf';
};

const issueCredential = async (req, res) => {
    try {
        const { studentName, studentEmail, studentId, degree, expiryDate } = req.body;
        const institution = req.user.institutionName;
        const issuedBy = req.user._id;

        if (!studentName || !studentEmail || !studentId || !degree || !req.file) {
            return res.status(400).json({ message: 'Missing required fields or certificate PDF' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentEmail)) {
            return res.status(400).json({ message: 'The student email address is invalid' });
        }

        // Capture a local forensic baseline before publishing the document.
        // If OCR/forensics fails, issuance continues with a hash baseline and a warning.
        let baseline = {
            originalDocumentHash: sha256Buffer(req.file.buffer),
            originalMimeType: req.file.detectedMimeType || req.file.mimetype,
            originalFileName: req.file.originalname,
            baselineAnalysis: {
                warnings: [],
                analyzedAt: new Date(),
            },
        };

        try {
            baseline = await buildCredentialBaseline({
                buffer: req.file.buffer,
                mimeType: req.file.detectedMimeType || req.file.mimetype,
                originalName: req.file.originalname,
            });
        } catch (baselineError) {
            console.warn('Credential baseline AI analysis failed:', baselineError.message);
            baseline.baselineAnalysis.warnings.push(`Baseline AI analysis failed: ${baselineError.message}`);
        }

        // Upload to IPFS
        const ipfsFileName = `${studentId}_${degree}`.replace(/[^a-zA-Z0-9._-]/g, '_') + extensionFromName(req.file.originalname);
        const { ipfsHash, ipfsUrl } = await uploadToIPFS(req.file.buffer, ipfsFileName, {
            studentId,
            degree
        });

        // Generate unique credential ID
        const credentialId = "CRED-" + crypto.randomBytes(8).toString('hex').toUpperCase();
        
        // Blockchain Interaction
        const issueData = {
            credentialId,
            studentName,
            studentId,
            degree,
            institution,
            ipfsHash,
            issueDate: new Date().toISOString(),
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        };

        const blockchainRes = await issueCredentialOnChain(issueData);

        // Save to DB
        const credentialMeta = await CredentialMeta.create({
            credentialId,
            studentName,
            studentEmail,
            studentId,
            degree,
            institution,
            ipfsHash,
            ipfsUrl,
            originalDocumentHash: baseline.originalDocumentHash,
            originalMimeType: baseline.originalMimeType,
            originalFileName: baseline.originalFileName,
            transactionHash: blockchainRes.transactionHash,
            blockNumber: blockchainRes.blockNumber,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            issuedBy,
            isRevoked: false,
            baselineAnalysis: baseline.baselineAnalysis
        });

        // Send Email Notification
        try {
            await sendCredentialNotification(studentEmail, studentName, {
                credentialId,
                degree,
                institution
            });
        } catch (mailError) {
            console.warn('Mail notification failed but credential was issued:', mailError.message);
            // We don't return error here because the credential IS issued on blockchain and DB.
            // But we could inform the user.
        }

        res.status(201).json({
            message: 'Credential successfully issued',
            credential: credentialMeta
        });

    } catch (error) {
        console.error('Issue Error:', error);
        
        // Ensure we send a clean string message
        let clientMessage = 'Internal Server Error during issuance';
        if (error.message) {
            clientMessage = error.message;
        } else if (typeof error === 'string') {
            clientMessage = error;
        } else {
            clientMessage = JSON.stringify(error);
        }

        res.status(500).json({ message: clientMessage });
    }
};

const getMyIssuedCredentials = async (req, res) => {
    try {
        const credentials = await CredentialMeta.find({ issuedBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(credentials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyCredentials = async (req, res) => {
    try {
        const credentials = await CredentialMeta.find({ studentEmail: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json(credentials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const revokeCredential = async (req, res) => {
    try {
        const { credentialId } = req.params;

        const cred = await CredentialMeta.findOne({ credentialId, issuedBy: req.user._id });
        if (!cred) {
            return res.status(404).json({ message: 'Credential not found or unauthorized' });
        }
        
        if (cred.isRevoked) {
            return res.status(400).json({ message: 'Already revoked' });
        }

        // Blockchain Interaction
        const blockchainRes = await revokeCredentialOnChain(credentialId);

        cred.isRevoked = true;
        await cred.save();

        res.status(200).json({
            message: 'Credential revoked',
            transactionHash: blockchainRes.transactionHash,
            credentialId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    issueCredential,
    getMyIssuedCredentials,
    getMyCredentials,
    revokeCredential
};
