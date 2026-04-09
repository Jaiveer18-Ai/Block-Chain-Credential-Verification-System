const CredentialMeta = require('../models/CredentialMeta');
const { verifyCredentialOnChain } = require('../utils/blockchain');

const verifyCredential = async (req, res) => {
    try {
        const { credentialId } = req.params;

        // Verify on blockchain
        let onChainData;
        try {
            onChainData = await verifyCredentialOnChain(credentialId);
        } catch (error) {
           return res.status(404).json({ message: 'Credential not found on blockchain or blockchain error.' });
        }

        if (!onChainData.isValid && !onChainData.credentialData.studentName) {
            return res.status(404).json({ message: 'Credential does not exist.' });
        }

        // Fetch meta from DB for IPFS link and extra info
        const credentialMeta = await CredentialMeta.findOne({ credentialId }).populate('issuedBy', 'name institutionName email');

        res.status(200).json({
            isValid: onChainData.isValid,
            credentialData: onChainData.credentialData,
            meta: credentialMeta || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { verifyCredential };
