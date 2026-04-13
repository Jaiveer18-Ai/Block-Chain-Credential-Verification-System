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

        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET,
            }
        });
        
        return {
            ipfsHash: res.data.IpfsHash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading to IPFS:', error.message, error.response?.data || '');
        const details = error.response?.data?.error || error.response?.data?.message || error.message;
        throw new Error('IPFS Upload Failed: ' + details);
    }
};

module.exports = { uploadToIPFS };
