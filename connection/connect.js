// -----------------------------------------------------------------
// This is for connecting to the database

// Import mongoose
const mongoose = require('mongoose');

const connection = async () => {

    try  {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialMediaDB')
        console.log('\nConnection to DB !==Successful==!')
    } catch (err) {
        throw new Error('Connection to DB Failed..!')
    }
};


module.exports = connection;