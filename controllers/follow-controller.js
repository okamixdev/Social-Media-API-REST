// ----------------------------------------------------------------------------------
// Dependencies

// Imports the models
const Follow = require('../models/Follow');
const User = require('../models/User');
const mongoosePaginate = require('mongoose-pagination');

// Import helpers
const { isFollowing } = require('../helpers/followUID');


// ----------------------------------------------------------------------------------
// Methods

// ----------------------------------------------------------------------------------
// Follow a user and store it in the DB.
const followUser = async (req, res) => {

    // Get the  user to follow from the request body.
    const { userToFollow } = await req.body;

    // Get the user id from the request.
    const { id } = await req.userData;

    // Create a new follow object.
    const follow = new Follow({
        user: id,
        followed: userToFollow,
    });

    // Save the follow object to the DB.
    try {
        // Check if the user is already following the user.
        const isFollowing = await Follow.findOne({ user: id, followed: userToFollow });

        if (isFollowing) {
            // If the user is already following the user, return an error.
            return res.status(400).json({
                status: 'ERROR',
                message: 'You are already following this user.',
            });
        }

        // Save the follow object to the DB.
        await follow.save();

        // Update the user that is following.
        return res.status(200).json({
            status: 'SUCCESS',
            message: 'User followed successfully.',
            user: req.userData,
            follow
        });

    } catch (err) {
        // If there is an error, return it.
        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong while saving the follow to the DB.',
            error: err,
        });
    }
};

// ----------------------------------------------------------------------------------
// Unfollow a user and delete it from the DB.
const deleteFollow = async (req, res) => {

    // Get the user id from the request params.
    const { id } = await req.userData;

    // Get the selected user to unfollow.
    const { userToUnfollow } = await req.params;
    console.log(userToUnfollow);

    // Delete the follow object from the DB.
    try {
        // Delete the follow object from the DB.
        await Follow.findOneAndDelete({ user: id, followed: userToUnfollow });

        // Update the user that is following.
        return res.status(200).json({
            status: 'SUCCESS',
            message: 'User unfollowed successfully.',
            user: req.userData,
            unfollowed: userToUnfollow,
        });

    } catch (err) {
        // If there is an error, return it.
        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong while deleting the follow from the DB.',
            error: err,
        });
    };
};

// ----------------------------------------------------------------------------------
// List all the followers from a determined user.
const listFollowers = async (req, res) => {

    // Get the user id from the request params.
    let page = 1;

    // Get the user id from the request params.
    let { id } = await req.userData;

    // Get the id from the request params. (HIGH PRIORITY HIERARCHY)
    if (req.params.targetID) id = req.params.targetID;

    // Get the page from the request params. (HIGH PRIORITY HIERARCHY)
    if (req.params.page) page = req.params.page;

    // Show users by page.
    const itemsPerPage = 5;


    try {
        // Find the users that the user is following.
        const following = await Follow.find({ followed: id })
            // Populate the followed field with the user data.
            .populate('user', '-__v -password -role')
            .paginate(page, itemsPerPage)
            .exec()

        // Calculate the total of users.
        const total = await Follow.find({ user: id }).count();

        // Get the users that the user is following.
        const followedID = await isFollowing(id);



        // Return the result.
        res.status(200).json({
            status: 'SUCCESS',
            message: 'List of users that follow me.',
            follows_me: following,
            total,
            pages: Math.ceil(total / itemsPerPage),
            currently_following: followedID.usersFollowing,
            followers: followedID.userFollowers,
        });
    } catch (err) {
        console.log(err);
        // If there is an error, return it.
        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong while listing the following from the DB.',
            error: err,
        });
    }
};

// ----------------------------------------------------------------------------------
// List all the users that a determined user is following.
const listFollowing = async (req, res) => {
    // Get the user id from the request params.
    let page = 1;

    // Get the user id from the request params.
    let { id } = await req.userData;

    // Get the id from the request params. (HIGH PRIORITY HIERARCHY)
    if (req.params.targetID) id = req.params.targetID;

    // Get the page from the request params. (HIGH PRIORITY HIERARCHY)
    if (req.params.page) page = req.params.page;

    // Show users by page.
    const itemsPerPage = 5;

    try {
        // Find the users that the user is following.
        const following = await Follow.find({ user: id })
            // Populate the followed field with the user data.
            .populate('followed', '-__v -password -role')
            .paginate(page, itemsPerPage)
            .exec()

        // Calculate the total of users.
        const total = await Follow.find({ user: id }).count();


        const followedID = await isFollowing(id);



        // Return the result.
        res.status(200).json({
            status: 'SUCCESS',
            message: 'List of users that I follow.',
            following: following,
            total,
            pages: Math.ceil(total / itemsPerPage),
            currently_following: followedID.usersFollowing,
            followers: followedID.userFollowers,
        });
    } catch (err) {
        console.log(err);
        // If there is an error, return it.
        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong while listing the following from the DB.',
            error: err,
        });
    }

};


// ----------------------------------------------------------------------------------
// Export the methods
module.exports = {
    followUser,
    deleteFollow,
    listFollowers,
    listFollowing,
};