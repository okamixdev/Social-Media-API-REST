// ---------------------------------------------------------------
// Import dependencies

// Imports multer
const multer = require('multer');

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/posts/')
    },

    filename: (req, file, cb) => {
        cb(null, 'post-' + Date.now() + '--' + file.originalname);
    }
});

// Set up multer file filter
const uploads = multer({ storage: storage });


module.exports = {
    storage,
    uploads
};