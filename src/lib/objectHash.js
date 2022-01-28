// General imports
const crypto = require("crypto");

const objectHash = (obj, alg = "sha256", format = "hex") => {
    const hash = crypto.createHash(alg)
    const objectDigest = [...Object.keys(obj), ...Object.values(obj)]
    const nestedObjectDigest = objectDigest.reduce((acc, cur) => {
        return typeof cur === "object" && cur.constructor === Object ? 
            [...acc, objectHash(cur)] : 
            [...acc, cur]
    }, [])
    nestedObjectDigest.map(item => hash.update(item.toString()))
    return hash.digest(format)
}

// Exports
module.exports = objectHash;