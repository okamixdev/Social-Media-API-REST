// -------------------------------------------------------------------------
// Dependencies
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');
const { isFollowing } = require('../helpers/followUID')

// -------------------------------------------------------------------------
// Save a post
const createPost = async (req, res) => {

    // Get the body.
    const params = await req.body;

    // Return error if no res.
    if (!params.text) return res.status(400).send({ status: "ERROR", message: "No text in the request body" });

    // Create and save the post to the db
    let newPost = new Post(params);
    newPost.user = await req.userData.id;

    // Save to DB
    try {
        // Save to DB
        const postInfo = await newPost.save();

        // Return a success and the new post information.
        return res.status(200).send({
            status: "SUCESS",
            message: "Post created successfully!",
            postInfo
        });
    } catch (err) {
        // Returns an error if any.
        return res.status(404).send({
            status: "ERROR",
            message: "Error at saving the post to the DB"
        });
    }
};

// -------------------------------------------------------------------------
// Get a single post
const getSinglePost = async (req, res) => {

    // Get the Post id from url.
    const postID = await req.params.id;

    try {
        // Find a specific post with th id.
        const postInfo = await Post.findById(postID)

        // Return a success and the post information.
        return res.status(200).send({
            status: "SUCESS",
            message: "Post Information Below:",
            postInfo
        });

    } catch (err) {
        // Returns an error if any.
        return res.status(404).send({
            status: "ERROR",
            message: "Error at retrieving the post to the DB"
        });
    };
};

// -------------------------------------------------------------------------
// Get all the posts
const getAllPost = async (req, res) => {

    // Get the user ID.
    const userID = await req.userData.id;

    // Control the webpage.
    let page = 1;

    // Sets page to whatever page the user wants to display.
    if (req.params.page) { page = await req.params.page };

    // Sets the itemps we are going to display per page.
    const itemsPerPage = 5;

    try {
        // Find the user in the DB and then display all the posts organized.
        const userPostInfo = await Post.find({ user: userID })
            .sort('-created_at')
            .populate('user', '-password -__V -role')
            .paginate(page, itemsPerPage)
            .exec()

        // If there is no posts on the user then returns error.
        if (userPostInfo.lenght <= 0) {
            // Returns an error.
            return res.status(404).send({
                status: "ERROR",
                message: "No Posts to display at the moment"
            });
        }

        // Calculates the total of posts in the user model.
        let total = await Post.find({ user: userID }).count();

        // Return a success and the post information.
        return res.status(200).send({
            status: "SUCESS",
            message: "Post Information Below:",
            userPostInfo,
            page,
            pages: Math.ceil(total / itemsPerPage),
            total,
        });

    } catch (err) {
        // Returns an error if any.
        return res.status(404).send({
            status: "ERROR",
            message: "Error at retrieving the posts to the DB"
        });
    };

}

// -------------------------------------------------------------------------
// Delete a post
const removePost = async (req, res) => {

    // Get the id of the post that is requested to delete
    const postID = await req.params.id;

    try {
        // Find the post to delete and delete it from the DB
        const deletedPost = await Post.findOneAndDelete({ 'user': req.userData.id, '_id': postID }).exec()

        // Return a success and the post information.
        return res.status(200).send({
            status: "SUCESS",
            message: "Post Information Below:",
            deletedPost
        });

    } catch (err) {
        // Returns an error if any.
        return res.status(500).send({
            status: "ERROR",
            message: "Error at deleting the post from the DB"
        });
    };
};


// -------------------------------------------------------------------------
// Upload Files
const uploadImage = async (req, res) => {

    // Check if the file exists
    if (!req.file) {
        return res.status(404).send({
            status: 'ERROR',
            message: 'No file provided'
        })
    }

    // Get the post ID
    const postID = req.params.id;

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
        const postImgInfo = await Post.findByIdAndUpdate({ user: req.userData.id, _id: postID }, { file: req.file.filename }, { new: true })

        // Return result
        res.status(200).send({
            status: 'SUCCESS',
            message: 'Image uploaded succesfully',
            post: postImgInfo,
            post_image: image,
        })

    } catch (err) {
        return res.status(500).send({
            status: 'ERROR',
            message: 'Error saving the image to the DB'
        })
    }
};

// -------------------------------------------------------------------------
// Return images
const showImage = async (req, res) => {

    // Get the file name
    const file = req.params.fileName;
    const filePath = './uploads/posts/' + file;

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

// -------------------------------------------------------------------------
// Return posts of all the users I follow on the Feed.

const feed = async (req, res) => {

    // Get the current page.
    let page = 1;

    // Sets page to whatever page the user wants to display.
    if (req.params.page) { page = await req.params.page };

    // Set the elements per page.
    let itemsPerPage = 5;


    try {

        // Get the users I follow in an array.
        const myFollows = await isFollowing(req.userData.id)


        // Find Posts in Users that I follow.


        // Return result
        res.status(200).send({
            status: 'SUCCESS',
            message: 'Feed posts retrieved successfully',
            myFollows: myFollows.usersFollowing
        })
    } catch (err) {
        return res.status(500).send({
            status: 'ERROR',
            message: 'Error at displaying the posts in the feed'
        })
    }
};

module.exports = {
    createPost,
    getSinglePost,
    removePost,
    getAllPost,
    uploadImage,
    showImage,
    feed
};