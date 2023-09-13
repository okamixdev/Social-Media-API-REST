// ----------------------------------------------------------------
// Dependencies

// Import the Mongoose package
const { Schema, model } = require('mongoose');



// -----------------------------------------------------------------
// Create the Schema
const FollowSchema = new Schema({
    // The user that is following refers to the user that is logged in.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    // The user that is being followed refers to the user that is being followed.
    followed: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Export the model
module.exports = model('Follow', FollowSchema, 'follows');