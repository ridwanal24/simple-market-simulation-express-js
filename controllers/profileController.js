const prisma = require('../utils/prisma');

async function getProfile(req, res) {
    try {
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                username: true,
                email: true
            },
            where: {
                id: req.user.id
            }
        });

        return res.json(user);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getBalance(req, res) {
    try {
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                balance: true
            },
            where: {
                id: req.user.id
            }
        })

        return res.json(user);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getAssets(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            },
            include: {
                password: false,
                balance: false,
                created_at: false,
                user_items: {
                    include: {
                        item: true
                    }
                }
            }
        })

        res.json(user);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getProfile,
    getBalance,
    getAssets,
}