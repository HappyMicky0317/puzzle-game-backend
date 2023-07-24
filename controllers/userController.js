const test = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running"
    })
}

module.exports = {
    test
}