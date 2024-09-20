const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
    const connect = await mongoose.connect(process.env.MONGO_URI)
    console.log(`this connection is on ${connect.connection.host}`)
    try {
        
    } catch (error) {
        throw new Error(`error: ${error.message} `)
    }
}