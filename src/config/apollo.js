// Builds and exports an apollo server, built from each graphqlModule defined
// in ../models/*

// General imports
const { ApolloServer } = require("apollo-server-express");

// Own imports - importing all of the schemas (typeDefs), and resolvers defined
// under ./models
const Auth = require("../models/graphql/auth").graphqlModule
const User = require("../models/graphql/user").graphqlModule
const Guild = require("../models/graphql/guild").graphqlModule
const Settings = require("../models/graphql/settings").graphqlModule
const Channel = require("../models/graphql/channel").graphqlModule
const Role = require("../models/graphql/role").graphqlModule 

// Export apollo server, built with all of the models (schemas and resolvers)
// imported above
module.exports = new ApolloServer({
    // Note that order of modules in array is not important - i.e. A may appear
    // before B in the array, even if A may require types defined within B
    modules: [
        Auth,
        User,
        Guild,
        Settings,
        Channel,
        Role,
    ],
    // the context lets you access the request in the querys/mutations this is 
    // normally used for fetching cookies or setting the user
    context: ({ req, res }) => {
        const user = req.user
        const cookies = req.cookies

        return {
            user: user,
            cookies: cookies,

            clearCookie: (cookie) => {
                res.clearCookie(cookie)
            },
        }
    },
    // apollo server playground (playground and introspection) should be
    // disabled for production by setting the 2 below fields to false
    introspection: true,
    playground: true,
});