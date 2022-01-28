// General imports
const { gql } = require("apollo-server-express");

// Define modular extensions to the graphql schema
const typeDefs = gql`
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Query: {
    },
    Mutation: {
    }
}
// Package graphql schema (typeDefs), and resolvers as graphql schema module
// imported by ../server.js to build the apollo server
const graphqlModule = { typeDefs, resolvers }

// Exports
module.exports = {
    graphqlModule: graphqlModule
}