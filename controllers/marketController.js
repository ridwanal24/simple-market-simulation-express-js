const prisma = require('../utils/prisma')

async function getDepth(req, res) {
    const { asset = '' } = req.query || {}

    if (!asset) {
        return res.status(400).json({
            message: 'asset belum diisi'
        })
    }

    const item = await prisma.item.findUnique({
        where: {
            id: parseInt(asset)
        }
    })

    if (!item) {
        return res.status(404).json({
            message: 'Asset tidak ditemukan'
        })
    }

    const bid = await prisma.marketRequest.findMany({
        where: {
            item_id: parseInt(asset)
        },
        orderBy: [
            {
                price: 'desc'
            },
            {
                created_at: 'asc'
            }
        ],
        select: {
            price: true,
            quantity: true
        },
        take: 10
    })

    const ask = await prisma.marketListing.findMany({
        where: {
            item_id: parseInt(asset)
        },
        orderBy: [
            {
                price: 'asc'
            },
            {
                created_at: 'asc'
            }
        ],
        select: {
            price: true,
            quantity: true
        },
        take: 10
    })


    return res.json({
        ask,
        bid
    });
}

module.exports = {
    getDepth
}