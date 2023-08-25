// ----------------------------------------------------------------------------------
// Imports Express router and user-controllers
const router = require('express').Router();
const userController = require('../../controllers/user-controller');

// Set up all the routes.
// User routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/auth-test', userController.test)



module.exports = router;