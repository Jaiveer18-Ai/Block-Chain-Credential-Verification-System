require('dotenv').config();
const { verifyCredentialOnChain } = require('./utils/blockchain');

async function test() {
    try {
        console.log("Testing verification for CRED-4844C64FC8F1D524...");
        const res = await verifyCredentialOnChain("CRED-4844C64FC8F1D524");
        console.log("On Chain Success:", res);
        
        const connectDB = require('./config/db');
        await connectDB();
        
        const CredentialMeta = require('./models/CredentialMeta');
        const meta = await CredentialMeta.findOne({ credentialId: "CRED-4844C64FC8F1D524" }).populate('issuedBy');
        console.log("DB Meta:", meta);
        process.exit();
    } catch(err) {
        console.error("Caught error:", err);
        process.exit(1);
    }
}
test();
