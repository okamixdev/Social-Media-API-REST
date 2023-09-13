// ---------------------------------------------------------------------------------------------
const User = require('../models/User');
const bcrypt = require('bcrypt');
// Imports the jwt token helper
const jwt = require('../helpers/jwt')
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path'); 
const { imFollowed, isFollowing } = require('../helpers/followUID');

// ---------------------------------------------------------------------------------------------
// 
const register = async (req, res) => {
    // Get data from request body
    let params = req.body;

    // Check the data is valid
    if (!params.first || !params.last || !params.username || !params.email || !params.password) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'Missing DATA',
        });
    };

    // Check if user already exists
    let users = await User.find({
        $or: [
            { username: params.username.toLowerCase() },
            { email: params.email.toLowerCase() },
        ]
    })

    try {
        if (users && users.length >= 1) {
            return res.status(200).json({ status: 'ERROR', message: 'User already exists' });
        }
    } catch (err) {
        return res.status(500).json({ status: 'ERROR', message: 'DB Error' });
    }

    // Encrypt the password
    let hash = await bcrypt.hash(params.password, 10);
    params.password = hash;

    // Create new OBJECT
    let newUser = new User(params);

    // Save the user in the DB
    try {
        await newUser.save();
        return res.status(200).json({
            message: '//- User Registered Successfully -//',
            newUser
        });
    } catch (err) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error saving the user to the DB',
        });
    };
};

// ---------------------------------------------------------------------------------------------
// Login
const login = async (req, res) => {

    // Get params
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'Missing Data'
        })
    }


    try {

        // Search on DB if it exists.
        const userData = await User.findOne({ email: params.email })
        // Sends everything but the password 
        // .select({'password': 0})


        if (!userData) { res.status(404).json({ status: 'ERROR', message: 'Wrong username or email' }) }

        // Check password and see if it matches
        let pwd = await bcrypt.compareSync(params.password, userData.password);

        // Sends an error if the pwps dont match
        if (!pwd) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Wrong password!!'
            })
        }

        // Return Token
        const Token = jwt.createToken(userData);

        // Return user data.
        return res.status(200).send({
            status: 'SUCCESS',
            message: 'Logged In',
            user: {
                id: userData._id,
                name: userData.first + ' ' + userData.last,
                email: userData.email,
                username: userData.username,
            },
            Token,
        })


    } catch (err) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Wrong email or pasword'
        })
    }
};

// ---------------------------------------------------------------------------------------------
// Get a single user
const getUser = async (req, res) => {
    // Get ID parameter from res
    const id = req.params.id;


    try {
        // Get data based on id
        const user = await User.findById(id).select({ password: 0, role: 0 });


        // If the user is not found then send an err.
        if (!user) { return res.status(404).send({ status: 'ERROR', message: 'No user found with the provided ID!' }) }

        // Get the follow info
        const followInfo = await imFollowed(req.userData.id, id);


        // Return result
        return res.status(200).send({
            status: 'SUCCESS',
            userProfile: user,
            following: followInfo.following,
            followers: followInfo.followers,
        })

    } catch (err) {
        return res.status(400).send({
            status: 'ERROR',
            message: 'Server Error'
        })
    }
};


// ---------------------------------------------------------------------------------------------
// List all of the users on page
const getAllUsers = async (req, res) => {
    // Check and control in what page we are currently in
    let page = 1;
    if (req.params.page) { page = req.params.page };

    // Sets the page number to always be int
    page = parseInt(page);

    // Check with mongoose pagination
    let itemsPerPage = 5;

    try {

        // Gets all the user and auto paginates them based on itemsPerPage limiter and what page we want
        const userData = await User.find().sort('_id').paginate(page, itemsPerPage).select({ password: 0, role: 0 })

        // Returns error if there is no data
        if (!userData) {
            return res.status(500).send({
                status: 'ERROR',
                message: 'Server Error',
                err
            })
        }

        // Total of users
        const total = await User.count();

        // Get the user id from the request.
        const { id } = req.userData;
        // Get the follow info
        const followedID = await isFollowing(id);

        // Retrun the follow result
        return res.status(200).send({
            status: 'SUCCESS',
            users: userData,
            page,
            itemsPerPage,
            total,
            // total of pages
            pages: Math.ceil(total / itemsPerPage),
            currently_following: followedID.usersFollowing,
            followers: followedID.userFollowers,
        })



    } catch (err) {
        return res.status(500).send({
            status: 'ERROR',
            message: 'Server Error',
        })
    }
};


// ---------------------------------------------------------------------------------------------
// UPDATE an existing user while its logged in
const updateUsers = async (req, res) => {
    // Get the info from user
    let userIdentity = await req.userData;
    let userToUpdate = await req.body;

    // Delete the leats important parts of the user info
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;

    // Check if user already exists
    let users = await User.find({
        $or: [
            { username: userToUpdate.username.toLowerCase() },
            { email: userToUpdate.email.toLowerCase() },
        ]
    })

    try {
        const userExists = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) { userExists = true };
        });

        if (userExists) {
            return res.status(200).json({ status: 'ERROR', message: 'User already exists' });
        }
    } catch (err) {
        return res.status(500).json({ status: 'ERROR', message: 'DB Error' });
    }

    if (userToUpdate.password) {
        // Encrypt the password
        let hash = await bcrypt.hash(userToUpdate.password, 10);
        userToUpdate.password = hash;
    }

    try {
        // UPDATE USER
        await User.findByIdAndUpdate({_id: userToUpdate._id}, req.body, { new: true })

        return res.status(200).send({
            status: 'SUCCESS',
            message: '//- User Updated Successfully -//',
            UPDATED: userToUpdate
        })

    } catch (err) {
        return res.status(500).json({ status: 'ERROR', message: 'Error updating the user...' });
    }
};

// ---------------------------------------------------------------------------------------------
// Upload an avatar
const uploadAvatar = async (req, res) => {

    // Check if the file exists
    if (!req.file) {
        return res.status(404).send({
            status: 'ERROR',
            message: 'No file provided'
        })
    }

    // Get the file name
    let image = req.file.originalname;

    // Get the file extension
    let imageExtension = image.split('.')[1];

    // Check if the file is an image
    if (imageExtension != 'png' && imageExtension != 'jpg' && imageExtension != 'jpeg' && imageExtension != 'gif') {

        // Delete the file if it is not an image
        const filePath = req.file.path;
        const deletedFile = fs.unlinkSync(filePath);

        // Return error
        return res.status(400).send({
            status: 'ERROR',
            message: 'Invalid file type'
        });
    };

    // Save the image to the DB
    try {
        // Update the user
        const updatedUser = await User.findByIdAndUpdate({_id: req.userData.id}, { img: req.file.filename }, { new: true }).select({ password: 0, role: 0 })

        // Return result
        res.status(200).send({
            status: 'SUCCESS',
            message: 'Avatar uploaded successfully',
            user: updatedUser,
            newAvatar: image,
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send({
            status: 'ERROR',
            message: 'Error saving the image to the DB'
        })
    }
};

// ---------------------------------------------------------------------------------------------
// Get the avatar
const showAvatar = async (req, res) => {

    // Get the file name
    const file = req.params.avatarName;
    const filePath = './uploads/avatars/' + file;

    // Check if the file exists
    fs.stat(filePath, (err, exist) => {
        if (err || !exist) {
            return res.status(404).send({
                status: 'ERROR',
                message: 'File does not exist'
            })
        }

        // Return the file
        res.status(200).sendFile(path.resolve(filePath));
    });
};





module.exports = {
    register,
    login,
    getUser,
    getAllUsers,
    updateUsers,
    uploadAvatar,
    showAvatar
};