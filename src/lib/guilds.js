// How we will get the users mutual guilds with the bot
const getPermissionGuilds = (userGuilds, botGuilds) => {
    return userGuilds.filter((guild) => botGuilds.find((botGuild) => botGuild.id === guild.id) && guild.permissions & 0x20 === 0x20);
}

// How we will check what guilds the bot is in and filter them into collections
const getMutualGuilds = (userGuilds, botGuilds) => {
    const validGuilds = userGuilds.filter((guild) => (guild.permissions & 0x20) == 0x20);
    const included = [];
    const excluded = validGuilds.filter((guild) => {
        const findGuild = botGuilds.find((g) => g.id == guild.id);
        if (!findGuild) return guild;
        included.push(findGuild);
    });

    return [excluded, included];
}

// Exports
module.exports = { getMutualGuilds, getPermissionGuilds };