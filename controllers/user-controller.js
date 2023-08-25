// ---------------------------------------------------------------------------------------------
const User = require('../models/User');
const bcrypt = require('bcrypt');
// Imports the jwt token helper
const jwt = require('../helpers/jwt')

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
        console.log(err);
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
        console.log(err);
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
        if (!pwd) {return res.status(400).json({
            status: 'ERROR',
            message: 'Wrong password!!'
        })}

        // Return Token
        const Token = jwt.createToken(userData);

        // Return user data.
        return res.status(200).send({
            status: 'SUCCESS',
            message: 'Login Action',
            fullName: {
                id: userData._id,
                name: userData.first + '' + userData.last,
                email: userData.email,
                username: userData.username,
            },
            Token
        })


    } catch (err) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Wrong email or pasword'
        })
    }
};


const test = () => {

}


module.exports = {
    register,
    login,
    test
};