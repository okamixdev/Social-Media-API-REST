// ---------------------------------------------------------------
// Import dependencies

// Imports multer
const multer = require('multer');

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars/')
    },

    filename: (req, file, cb) => {
        cb(null, 'userProfile-' + Date.now() + '--' + file.originalname);
    }
});

// Set up multer file filter
const uploads = multer({ storage: storage });


module.exports = {
    storage,
    uploads
};