// General imports
const { gql } = require("apollo-server-express");

// Own imports
const { getGuildChannels } = require("../../lib/api");

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Query {
        getChannels(
            id: String!
        ): [Channel]
    }

    type Channel {
        id: ID!
        type: Int
        name: String
        position: String
        nsfw: Boolean
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Query: {
        getChannels: async (_, args, context) => {
            const { id } = args;
            const channels = await getGuildChannels(id);
            return channels;
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