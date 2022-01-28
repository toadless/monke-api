const dotenvPath = process.env.NODE_ENV === "development" ? "/./config/.env/.env.dev" : "/./config/.env/.env"
require("dotenv").config({ path: __dirname + dotenvPath });

// General imports
const express = require("express");
const http = require("http");

// Own imports
const apollo = require("./config/apollo");
const discord = require("./lib/discord");
require("./config/mongodb");

// Initiating server - default express configuration
const PORT = process.env.PORT || 5000
const app = express()

// Load our apps middleware
const middleware = require("./config/middleware");
app.use(middleware);

// Set our discord route for auth
app.use(discord);

apollo.applyMiddleware({ app, cors: false })
// Build server using https or http depending on configurations declared above
const server = http.createServer(app)
// Run server, and console log on success
server.listen({ port: PORT }, () => {
    console.log(`Server listening on port ${PORT}`)
})