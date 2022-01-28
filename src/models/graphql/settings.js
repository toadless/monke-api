// General imports
const { gql } = require("apollo-server-express");

// Own imports
const Guild = require("../mongoose/guild");
const { getPermissionGuilds } = require("../../lib/guilds");
const { decrypt } = require("../../lib/auth");
const { getBotGuilds, getUserGuilds, updatePrefixCache } = require("../../lib/api");
const bypassLimit = require("../../lib/bypassLimit");

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Query {
        getSettings(
            id: String!
        ): Settings
    }

    extend type Mutation {
        setPrefix(
            id: String!
            prefix: String!
        ): Settings

        setLogChannel(
            id: String!
            channel: String!
        ): Settings

        setTempBanRole(
            id: String!
            role: String!
        ): Settings
    }

    type Settings {
        _id: ID
        prefix: String
        logchannel: String
        tempbanrole: String
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Query: {
        getSettings: async (_, args, context) => {
            const { id } = args;
            return await Guild.findOne({ _id: id });
        }
    },
    Mutation: {
        setPrefix: async (_, args, context) => {
            const { id, prefix } = args;

            /* */
            if (!context.user) throw new Error("not logged in");
    
            const ownGuilds = await bypassLimit(getBotGuilds);
            const userGuilds = await bypassLimit(getUserGuilds, decrypt(context.user.discord.accessToken));

            const permissionGuilds = getPermissionGuilds(ownGuilds, userGuilds);
            if (permissionGuilds.some(g => g.id != id)) new Error("no permissions");
            /* */

            const guild = Guild.findOneAndUpdate({ _id: id }, { prefix }, { new: true });

            updatePrefixCache(id, prefix);

            return guild;
        },
        setLogChannel: async (_, args, context) => {
            const { id, channel } = args;

            /* */
            if (!context.user) return null;

            const myGuilds = await botGuilds();
            const guilds = await userGuilds(decrypt(context.user.discord.accessToken));

            const permissionGuilds = getPermissionGuilds(myGuilds, guilds);
            if (permissionGuilds.some(g => g.id != id)) return null;
            /* */

            const guild = Guild.findOneAndUpdate({ _id: id }, { logchannel: channel }, { new: true });

            return guild;
        },
        setTempBanRole: async (_, args, context) => {
            const { id, role } = args;

            /* */
            if (!context.user) return null;

            const myGuilds = await botGuilds();
            const guilds = await userGuilds(decrypt(context.user.discord.accessToken));

            const permissionGuilds = getPermissionGuilds(myGuilds, guilds);
            if (permissionGuilds.some(g => g.id != id)) return null;
            /* */

            const guild = Guild.findOneAndUpdate({ _id: id }, { tempbanrole: role }, { new: true });

            return guild;
        }
    }
}
// Package graphql schema (typeDefs), and resolvers as graphql schema module
// imported by ../server.js to build the apollo server
const graphqlModule = { typeDefs, resolvers }

// Exports
module.exports = {
    graphqlModule: graphqlModule
}