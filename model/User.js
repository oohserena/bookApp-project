const mongoose = require('mongoose');

// user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    books: [{
        type: Object,
    }]
}, 
{
    timestamps: true,
});
// user model
const User = mongoose.model('User', userSchema);

module.exports = User;