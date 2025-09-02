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

    return res.json({
        message: 'Oke'
    });
}

module.exports = {
    getDepth
}