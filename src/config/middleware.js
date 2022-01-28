// We will define all of our middleware
// in this file and export it in an array
// and load it into express. This clears up
// clutter in the index file.

// General imports
const express = require("express");
const cors = require("cors");
const slowdown = require("express-slow-down");
const ratelimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// Own imports
const { setUser } = require("../lib/auth");

const corsMiddleware = cors({
    origin: [process.env.FRONT_END],
    credentials: true,
})

const ratelimitMiddleware = ratelimit({
    windowMs: 10000,
    max: 15,
    skipFailedRequests: false,
    headers: true,
})

const slowdownMiddleware = slowdown({
    windowMs: 60 * 1000,
    delayAfter: 7,
    delayMs: 100,
    maxDelay: 120,
    skipFailedRequests: false,
})

const jsonMiddleware = express.json();
const urlMiddleware = express.urlencoded({ extended: false });
const cookieMiddleware = cookieParser();

// Exports
module.exports = [
    cookieMiddleware,
    setUser,
    corsMiddleware,
    ratelimitMiddleware,
    slowdownMiddleware,
    jsonMiddleware,
    urlMiddleware,
]