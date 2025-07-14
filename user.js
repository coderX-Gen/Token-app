const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    tokens: Number,
    received: [
        {
            from: String,
            tokens: Number,
            message: String
        }
    ],
    sent: [
        {
            to: String,
            tokens: Number,
            message: String
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);
