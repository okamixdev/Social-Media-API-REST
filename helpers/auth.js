// ---------------------------------------------------------------
// Import dependencies
const jwt = require('jwt-simple');
const moment = require('moment');

// Import secret key
const libjwt = require('./jwt');
const secret = libjwt.secret;

// AUTH middleware function
const auth = async (req, res, next) => {
    // Check if the auth header comes back
    if (!req.headers.authorization) {
        return res.status(400).send({
            status: 'ERROR',
            message: 'Request does not have an auth header'
        })
    };

    // Clean and decode the token
    const token = await req.headers.authorization.replace(/[' "]+/g, '');
    try {
        let payload = await jwt.decode(token, secret)

        // Check token expiration
        if (payload.exp <= moment().unix()) {
            return res.status(400).send({
                status: 'ERROR',
                message: 'Expired Token'
            })
        }

        // Adds the userData to the request.
        req.userData = await payload;
        console.log(req.userData)

    } catch (err) {
        return res.status(404).send({
            status: 'ERROR',
            message: 'Invalid Token'
        })
    };

    // Next controller process.
    await next();
};

module.exports = {
    auth
};