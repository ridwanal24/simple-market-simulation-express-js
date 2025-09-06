const prisma = require('../utils/prisma')
const dayjs = require('dayjs')

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

    const bid = await prisma.marketRequest.groupBy({
        by: ['price'],
        where: {
            item_id: parseInt(asset)
        },
        _sum: {
            quantity: true
        },
        orderBy: [
            {
                price: 'desc'
            },
        ],

        take: 10
    })

    const bidResult = bid.map(item => {
        return {
            price: item.price,
            quantity: item._sum.quantity
        }
    })

    const ask = await prisma.marketListing.groupBy({
        by: ['price'],
        where: {
            item_id: parseInt(asset)
        },
        _sum: {
            quantity: true
        },
        orderBy: [
            {
                price: 'asc'
            },
        ],
        take: 10
    })

    const askResult = ask.map(item => {
        return {
            price: item.price,
            quantity: item._sum.quantity
        }
    })

    return res.json({
        ask: askResult,
        bid: bidResult
    });
}

async function getTransactions(req, res) {
    const { asset = '' } = req.query || {}

    if (!asset) {
        return res.status(400).json({
            message: 'asset belum diisi'
        })
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            item_id: parseInt(asset)
        },
        orderBy: [
            {
                timestamp: 'desc'
            }
        ],
        select: {
            id: true,
            price: true,
            quantity: true,
            timestamp: true
        },
        take: 100
    })

    return res.json(transactions);
}

async function getKlines(req, res) {
    const { asset = '', interval = '' } = req.query || {}
    const startTime = dayjs().subtract(500, 'minute')

    if (!asset) {
        return res.status(400).json({
            message: 'asset belum diisi'
        })
    }

    // if (!interval) {
    //     return res.status(400).json({
    //         message: 'interval belum diisi'
    //     })
    // }


    const transactions = await prisma.transaction.findMany({
        where: {
            item_id: parseInt(asset),
            timestamp: {
                gte: startTime.toDate()
            }
        },
        orderBy: [
            {
                timestamp: 'asc'
            }
        ],
        select: {
            id: true,
            price: true,
            quantity: true,
            timestamp: true
        }
    })

    const grouped = {}

    for (let tx of transactions) {
        const key = dayjs(tx.timestamp).startOf('minute').toISOString()

        if (!grouped[key]) {
            grouped[key] = {
                prices: [],
                first: tx.price,
                last: tx.price
            }
        } else {
            grouped[key].last = tx.price
        }

        grouped[key].prices.push(tx.price)
    }

    const candles = Object.entries(grouped).map(([time, data]) => ({
        startTime: time,
        open: data.first,
        high: Math.max(...data.prices),
        low: Math.min(...data.prices),
        close: data.last
    }))

    candles.slice(-500)

    return res.json(candles);
}

module.exports = {
    getDepth,
    getTransactions,
    getKlines
}