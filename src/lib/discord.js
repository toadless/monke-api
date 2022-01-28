// General imports
const express = require("express");

// Own imports
const { getDiscordTokens, getDiscordUser } = require("./api");
const { encrypt, generateAccessToken, generateRefreshToken } = require("./auth");
const serverResponse = require("./serverResponse");
const User = require("../models/mongoose/user");

// Defining the express router for the two discord
// auth endpoints.
const router = express.Router();

// define the scope that will be used by the discord
// uri and will be checked in the callback
const scope = ["identify", "guilds"].join(" ");

// login endpoint
router.get("/discord/login", (req, res) => {
    const encodedRedirect = encodeURIComponent(req.protocol + "://" + req.get('host') + "/discord/callback");
    const encodedScope = encodeURIComponent(scope);

    const authURI = [
        "https://discord.com/api/oauth2/authorize",
        "?client_id=",
        process.env.CLIENT_ID,
        "&redirect_uri=",
        encodedRedirect,
        "&response_type=code",
        "&scope=",
        encodedScope,
    ].join("");

    res.redirect(authURI);
})

// callback endpoint
router.get("/discord/callback", async (req, res) => {
    const { code } = req.query;

    if (code) {
        try {
            const tokens = await getDiscordTokens(code, req.protocol + "://" + req.get('host') + "/discord/callback");
            // checking if the scope is what we need so that we dont get
            // errors
            if (tokens.scope != scope) return res.status(400).send(serverResponse(400, "Bad request, Invalid scope"))

            const { access_token, refresh_token } = tokens;
            if (!access_token || !refresh_token) return res.status(400).send(serverResponse(400, "Bad request"))

            const user = await getDiscordUser(access_token);
            if (!user.id) return res.status(400).send(serverResponse(400, "Bad request"))

            const { id, username, avatar, discriminator } = user;

            // Now that we have the users information we
            // will want to store them in the database

            const encrypted_access_token = encrypt(access_token);
            const encrypted_refresh_token = encrypt(refresh_token);

            const usr = await User.findOneAndUpdate({ _id: id }, {
                discord: {
                    accessToken: encrypted_access_token,
                    refreshToken: encrypted_refresh_token,
                    expiry: new Date().setSeconds(new Date().getSeconds() + 604800), // 604800 is the time it takes for the access token to expire#
                },

                name: username,
                discriminator,
                avatar,
            }, { new: true })

            if (usr) {
                req.user = usr;
            } else {
                const newUser = await User.create({
                    discord: {
                        accessToken: encrypted_access_token,
                        refreshToken: encrypted_refresh_token,
                        expiry: new Date().setSeconds(new Date().getSeconds() + 604800), // 604800 is the time it takes for the access token to expire#
                    },

                    refreshTokens: [],

                    _id: id,
                    name: username,
                    discriminator,
                    avatar,
                })

                req.user = newUser;
            }
        } catch (err) {
            return res.status(500).send(serverResponse(500, "Internal server error"));
        }
    } else {
        return res.status(400).send(serverResponse(400, "Bad request"))
    }
    
    // Now we have the user in the database we want to create the accessToken and refreshToken
    // and send it to thir browser so that they are always logged in.

    if (!req.user) return res.status(400).send(serverResponse(400, "Bad request"));

    const accessToken = generateAccessToken({ _id: req.user.id });
    const refreshToken = generateRefreshToken({ _id: req.user.id });

    res.cookie("accessToken", accessToken.token, { httpOnly: true });
    res.cookie("refreshToken", refreshToken.token, { httpOnly: true });

    const user = await User.findOne({ _id: req.user.id });
    const newRefreshTokens = [...user.refreshTokens, { tokenJti: refreshToken.payloadHash }]
    const newUser = await User.findOneAndUpdate({ _id: req.user.id }, { refreshTokens: newRefreshTokens }, { new: true });

    res.redirect(process.env.REDIRECT_URL);
})

// Exports - Router
module.exports = router;