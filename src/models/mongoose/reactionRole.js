// General imports
const mongoose = require("mongoose");

module.exports = mongoose.model("ReactionRoles", {
    guildId: { type: mongoose.SchemaTypes.Long, required: true },
    messageId: { type: mongoose.SchemaTypes.Long, required: true },
    roleId: { type: mongoose.SchemaTypes.Long, required: true  },
    emoteId: { type: String, required: true },
})