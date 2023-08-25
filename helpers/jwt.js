// ---------------------------------------------------------------------------------------------
// Import dependencies
const jwt = require('jwt-simple');
const moment = require('moment');

// Define secret token key
const secret = 'my-secret-super-secret-kikin-key_2002=!@#';

// Function to generate tokens
const createToken = (userData) => {
    const payload = {
        id: userData._id,
        fullName: userData.first + '' + userData.last,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        img: userData.img,
        // Moment of the creation of this payload
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    // Returns the jwt encrypted token
    return jwt.encode(payload, secret);
};

module.exports = {
    createToken,
    secret
};