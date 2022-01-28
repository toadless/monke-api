// General imports
const { gql } = require("apollo-server-express");

// Own imports
const User = require("../mongoose/user");
const { checkToken } = require("../../lib/auth");

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Mutation {
        logout: Boolean!
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Mutation: {
        logout: async (_, args, context) => {
            // make sure that the user is logged in
            if (!context.user) return false;

            try {
                // gain the refresh token that the user currently has
                const refreshToken = context.cookies["refreshToken"];

                const user = await User.findOne({ _id: context.user._id });
                if (!user) return false;

                // parse the token and check the signature
                const token = checkToken(refreshToken);

                // check that the refresh token is valid and
                // if not we wont do anything
                if (!token) return false;

                // remove the users refresh token from the database
                user.refreshTokens = user.refreshTokens.filter(tkn => tkn.tokenJti != token.jti);

                // save the updated user object
                await user.save();
            } catch (error) {
                return false;
            }

            // clear the users cookies
            context.clearCookie("refreshToken");
            context.clearCookie("accessToken");

            return true;
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