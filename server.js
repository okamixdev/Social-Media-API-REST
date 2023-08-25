// -----------------------------------------------------------------
// IMPORTS
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

// -----------------------------------------------------------------
// LOGGING that the server started.
console.log('//- Starting the server -//');

// Import the connection file
const connection = require('./connection/connect.js');
// Starts the DB connection.
connection();


// -----------------------------------------------------------------
// Configure the express server
const app = express();
// Configure the PORT.
const PORT = process.env.PORT || 3001;

// CORS Configuration
app.use(cors());

// Parse the request body as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the routes
app.use(routes);



// -----------------------------------------------------------------
app.listen(PORT, (req, res) => {
    console.log(`Server listening on PORT: ${PORT} and runnig on http://localhost:${PORT}`);
});