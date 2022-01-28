// General imports
const { gql } = require("apollo-server-express");

// Own imports
const { getGuildRoles } = require("../../lib/api");

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Query {
        getRoles(
            id: String!
        ): [Role]
    }

    type Role {
        id: ID!
        name: String
        color: Int
        hoist: Boolean
        position: Int
        permissions: String
        permissions_new: String
        managed: Boolean
        mentionable: Boolean
        icon: String
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Query: {
        getRoles: async (_, args, context) => {
            const { id } = args;
            const roles = await getGuildRoles(id);
            return roles;
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