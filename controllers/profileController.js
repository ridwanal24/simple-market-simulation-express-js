async function getProfile(req, res) {
    const user = req.user;
    res.json(user);
}

module.exports = {
    getProfile
}