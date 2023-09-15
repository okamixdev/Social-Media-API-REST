// -------------------------------------------------------------------------
// Dependencies

const { Schema, model } = require('mongoose');


// Post Schema
const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    text: {
        type: String,
        required: true,
    },
    file: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Exports the Post model.
module.exports = model('Post', PostSchema, 'posts');