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
    const { asset = '' } = req.query || {}
    let userItems;

    try {
        if (asset) {
            const userItems = await prisma.userItem.findFirst({
                where: {
                    user_id: req.user.id,
                    item_id: parseInt(asset)
                },
                include: {
                    item: true,
                    item_id: false,
                    user_id: false
                }
            });

            return res.json(userItems);
        }
        const userItems = await prisma.userItem.findMany({
            where: {
                user_id: req.user.id,
            },
            include: {
                item: true,
                item_id: false,
                user_id: false
            }
        });
        return res.json(userItems);


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