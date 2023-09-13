// --------------------------------------------------------
// Import Schema and model from mongoose.
const { Schema, model } = require('mongoose');

// Create the User Schema.
const UserSchema = new Schema({
    first: {
        type: String,
        // unique: true,
        required: true,
    },
    last: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'USER',
    },
    img: {
        type: String,
        default: 'https://via.placeholder.com/150',
    },
    // followers: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Follow',
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Exports the User model.          // Saves on DB as 'users'
module.exports = model('User', UserSchema, 'users');