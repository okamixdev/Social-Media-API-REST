// ----------------------------------------------------------------------------------
// Imports Express router and post-controllers
const router = require('express').Router();
const postController = require('../../controllers/post-controller');
const withAuth = require('../../helpers/auth');
const multer = require('multer')

// Imports multer settings
const { uploads, storage } = require('../../helpers/multer-settings-post');

// ----------------------------------------------------------------------------------
// Routes
router.post('/savePost', withAuth.auth, postController.createPost);
router.post('/getPost/:id', withAuth.auth, postController.getSinglePost);
router.delete('/removePost/:id', withAuth.auth, postController.removePost);
router.get('/userPost/:id/:page?', withAuth.auth, postController.getAllPost);
router.post('/upload/:id', [withAuth.auth, uploads.single('file')], postController.uploadImage);
router.get('/getImage/:fileName', withAuth.auth, postController.showImage);
router.get('/feed/:page?', withAuth.auth, postController.feed)


// Export the router
module.exports = router;