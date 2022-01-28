// General imports
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

// Generating the user a new access token by using the
// refresh token when the current access token expires
// this will make sure that we can keep making calls on
// behalf of the user to the discord api.
const generateDiscordAccessToken = async (refreshToken) => {
    const response = await fetch(process.env.DISCORD_API + "/oauth2/token", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        })
    })
    return response.json();
}

// Getting the guilds that the bot is currently in so that we can
// check the mutual guilds with the user
const getBotGuilds = async () => {
    const response = await fetch(process.env.DISCORD_API + "/users/@me/guilds", {
        method: "GET",
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        }
    })
    return response.json();
}

// Getting the guilds roles so that we can display
// them on the dashboard for when the user changes
// the role for something in the database
const getGuildRoles = async (guildId) => {
    const response = await fetch(process.env.DISCORD_API + "/guilds/" + guildId + "/roles", {
        method: "GET",
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        }
    })
    return response.json();
}

// Getting the guilds channels so that we can display
// them on the dashboard for when the user changes
// the channel for something in the database
const getGuildChannels = async (guildId) => {
    const response = await fetch(process.env.DISCORD_API + "/guilds/" + guildId + "/channels", {
        method: "GET",
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        }
    })
    return response.json();
}

// Get the guilds that the user is currently in so that
// we can keep it up to date and that the user does not
// keep having to log out an into the dashboard once they
// create/join a guild.
const getUserGuilds = async (accessToken) => {
    const response = await fetch(process.env.DISCORD_API + "/users/@me/guilds", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    return response.json();
}

// fetching the discord tokens from the authorization code
// we get when the user authorizes our application
const getDiscordTokens = async (code, redirect) => {
    const response = await fetch(process.env.DISCORD_API + "/oauth2/token", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirect,
        })
    })
    return response.json();
}

// fetching the user after we have got their refresh and access token
// from the authorization_code
const getDiscordUser = async (accessToken) => {
    const response = await fetch(process.env.DISCORD_API + "/users/@me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    return response.json();
}

// Exports
module.exports = { 
    getBotGuilds, 
    getGuildRoles,
    getGuildChannels,
    getUserGuilds,

    getDiscordTokens,
    getDiscordUser,
    generateDiscordAccessToken,
};