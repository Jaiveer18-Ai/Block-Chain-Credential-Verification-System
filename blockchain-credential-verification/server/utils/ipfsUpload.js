const { PinataSDK } = require('pinata-web3');

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT || null, // Optional if API key structure isn't JWT, wait let's use the Pinata API Key pattern from user
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET,
});

// Since pinata SDK usually takes auth differently now depending on version, fallback to plain axios if needed
// Actually, user specified "IPFS via Pinata for storing certificate PDFs" and we installed `pinata-web3`.
// `pinata-web3` has a slightly different setup process. Let's do a reliable axios fallback just in case or simple FormData.

const axios = require('axios');
const FormData = require('form-data');

const uploadToIPFS = async (fileBuffer, fileName, metadata = {}) => {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: fileName });
        
        // Add metadata to Pinata to ensure unique entries in the dashboard
        const pinataMetadata = JSON.stringify({
            name: fileName,
            keyvalues: {
                studentId: metadata.studentId || 'N/A',
                degree: metadata.degree || 'N/A',
                issuedAt: new Date().toISOString()
            }
        });
        formData.append('pinataMetadata', pinataMetadata);

        const headers = {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            timeout: 120000 // 120 seconds for mobile compatibility
        };

        // Prefer JWT if available, else fallback to API Key + Secret
        if (process.env.PINATA_JWT) {
            headers['Authorization'] = `Bearer ${process.env.PINATA_JWT}`;
        } else {
            headers['pinata_api_key'] = process.env.PINATA_API_KEY;
            headers['pinata_secret_api_key'] = process.env.PINATA_SECRET;
        }

        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers
        });
        
        return {
            ipfsHash: res.data.IpfsHash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
        };
    } catch (error) {
        console.error('IPFS Upload Exception:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Extract the most meaningful error snippet
        let details = 'Unknown IPFS error';
        if (error.response?.data) {
            const data = error.response.data;
            // Handle case where data.error might be an object (Pinata style)
            const rawMsg = data.error || data.message || data;
            details = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
        } else if (error.code === 'ECONNABORTED') {
            details = 'Request timed out while connecting to Pinata';
        } else {
            details = error.message;
        }
        
        throw new Error(`IPFS Upload Failed: ${details}`);
    }
};

module.exports = { uploadToIPFS };
