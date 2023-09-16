// ------------------------------------------------------------------------
// Dependencies
const Follow = require('../models/Follow');

// -----------------------------------------------------------------------
// Methods

// -----------------------------------------------------------------------
// Get the users that the user is following/being followed.
const isFollowing = async (userID) => {
    // Get the users that the user is following.
    let following = await Follow.find({ user: userID }).select({ followed: 1, _id: 0 })
        .exec()
        .then((follows) => { return follows })
        .catch((err) => { return handleError(err) });

    // Get the followers from the user.
    let followers = await Follow.find({ followed: userID }).select({ user: 1, _id: 0 })
        .exec()
        .then((follows) => { return follows })
        .catch((err) => { return handleError(err) });


    // Get the users that the user is following. (CLEAN WAY)
    let usersFollowing = [];
    following.forEach((follow) => {
        usersFollowing.push(follow.followed);
    });


    // Get the users that are following the user. (CLEAN WAY)
    let userFollowers = [];
    followers.forEach((follow) => {
        userFollowers.push(follow.user);
    });



    return { usersFollowing, userFollowers }
};

// -----------------------------------------------------------------------
// Get the users that are following me.
const imFollowed = async (userID, userToCheck) => {


    let following = await Follow.findOne({ user: userID, followed: userToCheck })

    // Get the followers from the user.
    let followers = await Follow.findOne({ user: userToCheck, followed: userID })


    return { following, followers };



};



module.exports = {
    isFollowing,
    imFollowed
};