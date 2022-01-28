// Own imports
const objectHash = require("./objectHash")
// Export
module.exports = (statusCode = 200, message = "", payload = {}) => {
    const resPayload = {
        ...payload,
        statusCode: statusCode,
        message: message
    }
    return {
        statusCode: statusCode,
        message: message,
        payload: resPayload,
        payloadHash: objectHash(resPayload)
    }
}