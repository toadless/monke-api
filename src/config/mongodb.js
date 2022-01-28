// Require this config file early in relevant files (mainly index.js), in order
// to connect to the mongodb server with mongoose

// Declare required environment variables
const url = process.env.MONGO_DB;

// General imports 
const mongoose = require("mongoose")
require('mongoose-long')(mongoose);

// Connect to server using mongoose
mongoose.connect(url, { useNewUrlParser: true })
mongoose.connection.once("open", () => {
    console.log(`Connected to mongo database at ${url}`)
})