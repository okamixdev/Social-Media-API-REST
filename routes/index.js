// ---------------------------------------------------------------------------
const router = require('express').Router();

const userRoutes = require('./api/user-routes');
const postRoutes = require('./api/post-routes');
const followRoutes = require('./api/follow-routes');

router.use('/api/user', userRoutes);
router.use('/api/post', postRoutes);
router.use('/api/follows', followRoutes);

module.exports = router;