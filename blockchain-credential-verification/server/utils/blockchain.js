const { ethers } = require('ethers');

// This ABI should match our compiled contract.
// We will export the ABI from Hardhat into the client and server manually after testing.
let contractABI = [];
try {
    const abiData = require('../../blockchain/artifacts/contracts/CredentialVerification.sol/CredentialVerification.json');
    contractABI = abiData.abi;
} catch (error) {
    console.warn("Smart Contract ABI not found yet. Will fail blockchain transactions.");
}

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
    const contract = getBlockchainContract();
    
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
            maxFeePerGas: ethers.parseUnits("35", "gwei"),
            maxPriorityFeePerGas: ethers.parseUnits("35", "gwei")
        }
    );
    
    const receipt = await tx.wait();
    return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
    };
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
