// General imports
const { gql } = require("apollo-server-express");

// Own imports
const { decrypt } = require("../../lib/auth");
const { getMutualGuilds } = require("../../lib/guilds");
const { getBotGuilds, getUserGuilds } = require("../../lib/api");
const bypassLimit = require("../../lib/bypassLimit");

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Query {
        getGuilds: MutualGuilds
    }

    type Guild {
        id: ID!
        name: String
        icon: String
        owner: Boolean
        permissions: String
        features: [String]
        permissions_new: String
    }

    type MutualGuilds {
        included: [Guild]
        excluded: [Guild]
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Query: {
        getGuilds: async (_, args, context) => {
            const user = context.user;
            if (!user) return;

            try {
                const ownGuilds = await bypassLimit(getBotGuilds);
                const userGuilds = await bypassLimit(getUserGuilds, decrypt(user.discord.accessToken));

                const [excludedGuilds, includedGuilds] = getMutualGuilds(userGuilds, ownGuilds);

                return { included: includedGuilds, excluded: excludedGuilds };
            } catch (err) {
                return null;
            }
        }
    },
}
// Package graphql schema (typeDefs), and resolvers as graphql schema module
// imported by ../server.js to build the apollo server
const graphqlModule = { typeDefs, resolvers }

// Exports
module.exports = {
    graphqlModule: graphqlModule
}