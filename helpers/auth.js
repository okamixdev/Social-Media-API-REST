// ---------------------------------------------------------------
// Import dependencies
const jwt = require('jwt-simple');
const moment = require('moment');

// Import secret key
const libjwt = require('./jwt');
const secret = libjwt.secret;

// AUTH function
const auth = (req, res, next) => {
    
};