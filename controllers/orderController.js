/**
 * Asset
 * Type : Market, Limit
 * Side : Buy, Sell
 * Qty
 * Price
 */

const prisma = require('../utils/prisma');
const orderServices = require('../services/orderServices');

async function createOrder(req, res) {
    const { asset = '', type = '', side = '', qty = 0, price = 0 } = req.body || {}

    if (!asset || !type || !side || !qty) {
        return res.status(400).json({ message: 'Bad Request' });
    }

    // wajib ada price jika type limit
    if (type === 'limit' && !price) {
        return res.status(400).json({ message: 'Price kosong' });
    }

    // cek dulu asset nya ada gk
    const item = await prisma.item.findUnique({ where: { id: asset } });
    if (!item) {
        return res.status(400).json({ message: 'Asset tidak ada' });
    }

    // - Jika Limit Buy
    // param : price, qty
    if (type === 'limit' && side === 'buy') {
        //  jika price lebih tinggi atau sama dengan ask terendah, buat jadi market
        const ask = await prisma.marketListing.findFirst({
            where: {
                item_id: asset
            },
            orderBy: [
                {
                    price: 'asc',
                },
                {
                    created_at: 'asc'
                }
            ]
        })

        if (ask && price >= ask.price) {
            return orderServices.createBuyMarket(req, res, asset, qty);
        }

        return orderServices.createBuyLimit(req, res, asset, qty, price);
    }

    // - Jika Limit Sell
    // param : price, qty
    if (type === 'limit' && side === 'sell') {
        // jika price lebih rendah atau sama dengan bid tertinggi, buat jadi market
        const bid = await prisma.marketRequest.findFirst({
            where: {
                item_id: asset
            },
            orderBy: [
                {
                    price: 'desc',
                },
                {
                    created_at: 'asc'
                }
            ]
        })

        if (bid && price <= bid.price) {
            return orderServices.createSellMarket(req, res, asset, qty);
        }

        return orderServices.createSellLimit(req, res, asset, qty, price);
    }

    // - Jika Market Buy
    // param : qty
    if (type === 'market' && side === 'buy') {
        return orderServices.createBuyMarket(req, res, asset, qty);
    }

    // - Jika Market Sell
    // param : qty
    if (type === 'market' && side === 'sell') {
        return orderServices.createSellMarket(req, res, asset, qty);
    }

}

async function cancelOrder(req, res) { }

async function getOrders(req, res) { }

module.exports = {
    createOrder,
    getOrders
}