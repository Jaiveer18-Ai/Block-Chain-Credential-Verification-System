require('dotenv').config();
const { uploadToIPFS } = require('./utils/ipfsUpload');

async function test() {
    try {
        const dummyBuffer = Buffer.from("Hello world, testing IPFS");
        console.log("Testing Pinata IPFS upload...");
        const res = await uploadToIPFS(dummyBuffer, "test.txt");
        console.log("Success:", res);
    } catch(err) {
        console.error("Caught error from IPFS:", err.message);
    }
}
test();
