import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x00";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    
    useEffect(() => {
        if (window.ethereum) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
        } else {
             const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/demo";
             const fallbackProvider = new ethers.JsonRpcProvider(rpcUrl);
             setProvider(fallbackProvider);
        }
    }, []);

    const verifyOnChain = async (credentialId, abi) => {
        if (!provider || CONTRACT_ADDRESS === "0x00") return null;
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
            const [cred, isValid] = await contract.verifyCredential(credentialId);
            return { cred, isValid };
        } catch (error) {
            console.error("Web3 Verification failed", error);
            return null;
        }
    };

    return (
        <Web3Context.Provider value={{ provider, verifyOnChain }}>
            {children}
        </Web3Context.Provider>
    );
};
