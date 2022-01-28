// General imports
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Own imports
const User = require("../models/mongoose/user");
const { generateDiscordAccessToken } = require("./api");
const objectHash = require("./objectHash");

// A simple function to decrypt an access token
// from the database
const decrypt = (encryptedString) => {
    return cryptojs.AES.decrypt(encryptedString, process.env.ENCRYPTION_KEY).toString(cryptojs.enc.Utf8);
}

// A simple function to encrypt an access token
// for added security
const encrypt = (string) => {
    return cryptojs.AES.encrypt(string, process.env.ENCRYPTION_KEY).toString();
}

// Checking the type of token that the user has
const checkToken = token => {
    if (!token) { return null }
    // Set JWT_SECRET to correct value based on the subject claim of the
    // incoming jwt
    let JWT_SECRET
    switch (jwt.decode(token).sub) {
        case "REFRESH_TOKEN":
            JWT_SECRET = process.env.JWT_SECRET_REFRESH_TOKEN
            break
        case "ACCESS_TOKEN":
            JWT_SECRET = process.env.JWT_SECRET_ACCESS_TOKEN
            break
        default:
            JWT_SECRET = null
    }

    try {
        // jwt token verification performed synchronously if no callback
        // is passed - therefore call is wrapped in a try catch block
        // in case jwt.verify() throws an error
        return jwt.verify(token, JWT_SECRET)
    } catch {
        return null
    }
}

// Setting req.user for the graphql calls
const setUser = async (req, res, next) => {
    const accessToken = req.cookies["accessToken"];
    if (!accessToken) {
        req.user = null;
        return next();
    }

    let token = checkToken(accessToken);

    if (!token) { // If the access token is invalid or expired and they have a refresh token
        // we will "refesh" their access token.

        const refreshToken = req.cookies["refreshToken"];
        if (!refreshToken) {
            req.user = null;
            return next();
        }

        const rToken = checkToken(refreshToken);
        if (!rToken) {
            req.user = null;
            return next();
        }

        const user = await User.findOne({ _id: rToken._id });
        if (!user) {
            req.user = null;
            return next();
        }

        const refreshTokenJTI = jwt.decode(refreshToken).jti;

        let hasRefreshToken = false;
        user.refreshTokens.map(tkn => {
            if (tkn.tokenJti === refreshTokenJTI) hasRefreshToken = true;
        })
        if (!hasRefreshToken) {
            req.user = null;
            return next();
        }

        const accessToken = generateAccessToken({ _id: user._id });
        res.cookie("accessToken", accessToken.token, { httpOnly: true, }); // Sending the newly generated access token to the user
        token = checkToken(accessToken.token);
    }

    const user = await User.findOne({ _id: token._id });
    if (!user) {
        req.user = null;
        return next();
    }

    // Checking if the users discord access token
    // has expired. If it has expired then we will
    // request a new one. If the request fails then
    // we will know that the user has deauthorized
    // the application through discord. We will wrap
    // the code block in try/catch to see if the request
    // fails.
    try {
        if (user.discord.expiry <= new Date()) {
            const discordRefreshToken = user.discord.refreshToken;
            const discordAccessToken = await generateDiscordAccessToken(decrypt(discordRefreshToken));

            if (discordAccessToken.error) {
                // At this point the user would have
                // deauthorized our app to we are going
                // to clear their accessToken and
                // refreshToken and respond saying that
                // they are unauthorized

                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");

                req.user = null;
                return next();
            }

            // If we have successfully updated the users
            // access_token then we will update it in the 
            // database and then we will reset the expiry
            // date.
            const { access_token, refresh_token } = discordAccessToken;
            user.discord.accessToken = encrypt(access_token);
            user.discord.refreshToken = encrypt(refresh_token);
            user.discord.expiry = new Date().setSeconds(new Date().getSeconds() + 604800);
            await user.save();
        }
    } catch (error) {
        req.user = null;
        return next();
    }

    req.user = user;
    return next();
}

// The method we use to create/sign the JWT
const generateAccessToken = args => {
    const payload = {
        _id: args._id,
        nonce: crypto.randomBytes(32).toString("hex")
    }
    const payloadHash = objectHash(payload)
    const token = jwt.sign(
        { ...payload },
        process.env.JWT_SECRET_ACCESS_TOKEN,
        {
            algorithm: "HS256",
            issuer: "toadless.net",
            audience: "toadless.net",
            subject: "ACCESS_TOKEN",
            expiresIn: "1h",
            jwtid: payloadHash
        }
    )
    return { token: token, payloadHash: payloadHash }
}

// The method we use to create/sign the JWT
const generateRefreshToken = args => {
    const payload = {
        _id: args._id.toString(),
        nonce: crypto.randomBytes(32).toString("hex")
    }
    const payloadHash = objectHash(payload)
    const token = jwt.sign(
        { ...payload },
        process.env.JWT_SECRET_REFRESH_TOKEN,
        {
            algorithm: "HS256",
            issuer: "toadless.net",
            audience: "toadless.net",
            subject: "REFRESH_TOKEN",
            // Amount of time equivalent to browser update cycle, at which time,
            // the clientHash of the user will change due to browser update,
            // and the user will have to revalidate themselves anyway
            expiresIn: "42d",
            jwtid: payloadHash
        }
    )
    return { token: token, payloadHash: payloadHash }
}

// Exports
module.exports = {
    encrypt,
    decrypt,

    setUser,

    checkToken,
    generateAccessToken,
    generateRefreshToken,
};