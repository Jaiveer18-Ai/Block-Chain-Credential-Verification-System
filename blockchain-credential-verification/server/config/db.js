const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`Local MongoDB connection failed (${error.message}).`);
        console.log(`Falling back to In-Memory MongoDB for seamless testing...`);
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            
            const memoryConn = await mongoose.connect(memoryUri);
            console.log(`In-Memory MongoDB Connected at: ${memoryUri}`);
        } catch (memError) {
            console.error(`Error connecting to In-Memory MongoDB: ${memError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
