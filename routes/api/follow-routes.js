// ----------------------------------------------------------------------------------
// Imports Express router and follow-controllers
const router = require('express').Router();
const followController = require('../../controllers/follow-controller');
const withAuth = require('../../helpers/auth')


// ----------------------------------------------------------------------------------
// Routes
router.post('/followUser', withAuth.auth ,followController.followUser);
router.delete('/unfollowUser/:userToUnfollow', withAuth.auth ,followController.deleteFollow);
router.get('/userFollowers/:targetID?/:page?', withAuth.auth ,followController.listFollowers);
router.get('/userFollowing/:targetID?/:page?', withAuth.auth ,followController.listFollowing);



// Export the router
module.exports = router;