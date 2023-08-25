// ---------------------------------------------------------------------------
const router = require('express').Router();

const userRoutes = require('./api/user-routes');
const postRoutes = require('./api/post-routes');
const followRoutes = require('./api/follow-routes');

router.use('/api', userRoutes);
// router.use('/api', postRoutes);
// router.use('/api', followRoutes);

module.exports = router;