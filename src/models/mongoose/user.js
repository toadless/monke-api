// General imports
const mongoose = require("mongoose");

// Own imports
const RefreshToken = require("./refreshToken");
const DiscordToken = require("./discordToken");

module.exports = mongoose.model("user", new mongoose.Schema({
    _id: { type: String, required: true },

    refreshTokens: { type: [RefreshToken], unique: true, required: true, default: [] },
    discord: { type: DiscordToken, required: true, },

    name: { type: String, required: true },
    discriminator: { type: String, required: true },
    avatar: { type: String, required: true },
}))