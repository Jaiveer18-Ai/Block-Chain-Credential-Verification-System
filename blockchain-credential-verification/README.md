# Blockchain-Based Credential Verification System

![Blockchain Verification](https://img.shields.io/badge/Blockchain-Polygon-purple) ![React](https://img.shields.io/badge/Frontend-React-blue) ![Node.js](https://img.shields.io/badge/Backend-Node-green)

A full-stack Web3 application where academic institutions can issue tamper-proof digital academic credentials stored on the Polygon blockchain and IPFS. Students can easily manage their credentials, and employers can instantly cryptographically verify them.

## 🚀 Features

- **Role-Based Access Control:** Separate dashboards and permissions for Institutions and Students.
- **Immutable Records:** Credentials minted on Polygon Amoy testnet.
- **Decentralized Storage:** Certificates (PDF/Images) securely uploaded to IPFS using Pinata.
- **Easy Sharing:** Generate QR codes and public links for 1-click verification.
- **Instant Revocation:** Institutions have the power to cryptographically revoke credentials.
- **Modern UI/UX:** Built with React, Vite, Tailwind CSS v4, and Lucide Icons.

## 🏗️ Architecture

```
User (Institution) -> Uploads Cert -> Backend -> Pinata IPFS -> IPFS Hash
        |                                                           |
        +-> Signs Metadata -> Alchemy RPC -> Polygon Blockchain <---+
                                                  |
Verifier (Employer) -> Scans QR -> Frontend -> Smart Contract Verify -> Valid/Invalid
```

## 🛠️ Prerequisites

- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)
- Metamask Wallet (or any Web3 Wallet)
- Alchemy Account (for Polygon Amoy RPC)
- Pinata Account (for IPFS)
- Testnet MATIC (for gas fees)

## 📦 Installation & Setup

Clone the repository and install dependencies in all three folders:

```bash
# 1. Start with the Blockchain setup
cd blockchain
npm install
# Create a .env file and add ALCHEMY_RPC_URL and WALLET_PRIVATE_KEY
# Compile and deploy the contract to Amoy Testnet
npx hardhat run scripts/deploy.js --network amoy
# Note down the deployed CONTRACT_ADDRESS

# 2. Setup the Server Backend
cd ../server
npm install
# Copy .env.example to .env and fill in the values (including CONTRACT_ADDRESS)
npm start # or node server.js

# 3. Setup the Frontend Client
cd ../client
npm install
# Copy .env.example to .env and fill in the values
npm run dev
```

## 📖 API Documentation

### Auth (`/api/auth`)
- `POST /register`: Register Institution or Student
- `POST /login`: JWT Login
- `GET /me`: Get User profile 

### Credentials (`/api/credentials`)
- `POST /issue`: [Institution] Upload to IPFS & Mint to blockchain
- `GET /my-issued`: [Institution] Get issued credentials
- `GET /my-credentials`: [Student] Get acquired credentials
- `PUT /revoke/:credentialId`: [Institution] Revoke on-chain 

### Verify (`/api/verify`)
- `GET /:credentialId`: Returns on-chain validity and off-chain IPFS link mapping

## 🤝 Contributing
Contributions, issues and feature requests are welcome!

## 📝 License
This project is [MIT](LICENSE) licensed.
