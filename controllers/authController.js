const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res) {
    const { username, password } = req.body;

    // cek username ada di database
    let user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    if (!user) {
        res.status(401).json({
            message: 'Username atau password salah'
        });

        return;
    }

    // verify password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        res.status(401).json({
            message: 'Username atau password salah'
        });

        return;
    }

    // create token

    const token = jwt.sign({
        id: user.id,
        username: user.username
    }, 'secret', {
        expiresIn: '1d'
    });

    res.json({
        message: "Login Sukses",
        token: token
    });
}

module.exports = {
    login
}