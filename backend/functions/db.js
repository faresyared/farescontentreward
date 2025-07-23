const mongoose = require('mongoose');

let isConnected;

const connectDB = async () => {
    if (isConnected) {
        // console.log('=> using existing database connection');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = mongoose.connection.readyState;
        // console.log('=> new database connection established');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err);
    }
};

module.exports = connectDB;