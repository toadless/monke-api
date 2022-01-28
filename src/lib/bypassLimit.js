const bypassLimit = async (apiCall, args) => {
    for (let i = 0; i < 5; i++) {
        const response = await apiCall(args);

        if (response.message == "You are being rate limited.") continue;
        return response
    }

    return null
}

// Exports
module.exports = bypassLimit