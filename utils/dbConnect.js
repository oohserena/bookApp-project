const mongoose = require('mongoose');

// DB connect
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('DB connected successfully');
    } catch (error) {
        console.log(`DB connection failed ${error.message}`);

    }
};

module.exports = dbConnect;