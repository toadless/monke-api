// General imports
const mongoose = require("mongoose");
require('mongoose-long')(mongoose);

module.exports = mongoose.model("Guild", {
    _id: { type: mongoose.SchemaTypes.Long, required: true },
    prefix: { type: String, required: true },
    tempbanrole: { type: String },
    logchannel: { type: String },
})