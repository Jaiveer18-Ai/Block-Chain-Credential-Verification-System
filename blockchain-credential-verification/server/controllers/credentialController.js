const CredentialMeta = require('../models/CredentialMeta');
const { uploadToIPFS } = require('../utils/ipfsUpload');
const { issueCredentialOnChain, revokeCredentialOnChain } = require('../utils/blockchain');
const { sendCredentialNotification } = require('../utils/emailService');
const crypto = require('crypto');

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

        // Upload to IPFS
        const { ipfsHash, ipfsUrl } = await uploadToIPFS(req.file.buffer, `${studentId}_${degree}.pdf`, {
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
            transactionHash: blockchainRes.transactionHash,
            blockNumber: blockchainRes.blockNumber,
            issuedBy,
            isRevoked: false
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
        res.status(500).json({ message: error.message || 'Internal Server Error' });
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
