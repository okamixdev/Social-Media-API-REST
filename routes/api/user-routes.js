// ----------------------------------------------------------------------------------
// Imports Express router and user-controllers
const router = require('express').Router();
const userController = require('../../controllers/user-controller');
const withAuth = require('../../helpers/auth')

// Imports multer settings
const { uploads, storage } = require('../../helpers/multer-settings');

// Set up all the routes.
// User routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', withAuth.auth, userController.getUser);
router.get('/list/:page?', withAuth.auth, userController.getAllUsers);
router.put('/update/', withAuth.auth, userController.updateUsers);
router.post('/upload-avatar', [withAuth.auth, uploads.single('file')], userController.uploadAvatar);
router.get('/avatar/:avatarName', withAuth.auth, userController.showAvatar);







module.exports = router;