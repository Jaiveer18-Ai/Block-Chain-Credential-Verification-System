const { ethers } = require('ethers');

// This ABI should match our compiled contract.
// We will export the ABI from Hardhat into the client and server manually after testing.
const contractABI = require('../config/contractABI.json');

const getBlockchainContract = () => {
    if (!process.env.ALCHEMY_RPC_URL || !process.env.WALLET_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
        throw new Error("Blockchain environment variables are missing.");
    }
    
    // Connect to Polygon Amoy Testnet via RPC
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    
    // Connect via Admin/Institution Wallet
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
    
    // Return contract instance
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
};

const issueCredentialOnChain = async (credData) => {
    try {
        const contract = getBlockchainContract();
        
        // Let's estimate gas first to be safe
        const gasLimit = await contract.issueCredential.estimateGas(
            credData.credentialId,
            credData.studentName,
            credData.studentId,
            credData.degree,
            credData.institution,
            credData.ipfsHash,
            Math.floor(new Date(credData.issueDate).getTime() / 1000),
            credData.expiryDate ? Math.floor(new Date(credData.expiryDate).getTime() / 1000) : 0
        ).catch(() => 500000n); // Fallback to generous limit if estimation fails
        
        // Use a more dynamic gas approach for Amoy testnet
        const tx = await contract.issueCredential(
            credData.credentialId,
            credData.studentName,
            credData.studentId,
            credData.degree,
            credData.institution,
            credData.ipfsHash,
            Math.floor(new Date(credData.issueDate).getTime() / 1000), // Unix timestamp
            credData.expiryDate ? Math.floor(new Date(credData.expiryDate).getTime() / 1000) : 0,
            {
                gasLimit: (gasLimit * 120n) / 100n, // 20% buffer
                // For EIP-1559, we should check current gas prices or use a high enough default for testnet
                maxFeePerGas: ethers.parseUnits("50", "gwei"), 
                maxPriorityFeePerGas: ethers.parseUnits("40", "gwei")
            }
        );
        
        const receipt = await tx.wait();
        return {
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Blockchain Transaction Error:', error);
        
        // Parse ethers errors
        let reason = error.reason || error.message;
        if (error.code === 'INSUFFICIENT_FUNDS') reason = 'Wallet has insufficient balance for gas fees';
        if (error.code === 'NONCE_EXPIRED') reason = 'Transaction nonce mismatch, please try again';
        if (error.code === 'REPLACEMENT_UNDERPRICED') reason = 'Network congestion, fee too low';
        
        throw new Error(`Blockchain Error: ${reason}`);
    }
};

const verifyCredentialOnChain = async (credentialId) => {
    const contract = getBlockchainContract();
    const [cred, isValid] = await contract.verifyCredential(credentialId);
    
    return {
        credentialData: {
            credentialId: cred.credentialId,
            studentName: cred.studentName,
            studentId: cred.studentId,
            degree: cred.degree,
            institution: cred.institution,
            ipfsHash: cred.ipfsHash,
            issueDate: Number(cred.issueDate) * 1000, // Back to ms
            expiryDate: Number(cred.expiryDate) * 1000,
            issuedBy: cred.issuedBy,
            isRevoked: cred.isRevoked
        },
        isValid
    };
};

const revokeCredentialOnChain = async (credentialId) => {
    const contract = getBlockchainContract();
    const tx = await contract.revokeCredential(credentialId);
    const receipt = await tx.wait();
    
    return {
        transactionHash: receipt.hash
    };
};

module.exports = {
    getBlockchainContract,
    issueCredentialOnChain,
    verifyCredentialOnChain,
    revokeCredentialOnChain
};
