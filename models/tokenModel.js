const mongoose = require('mongoose');

//Create a token schema
const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    token:{
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },

})

const Token = mongoose.model("Token", tokenSchema)

module.exports = Token