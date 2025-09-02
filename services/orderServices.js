const prisma = require('../utils/prisma');

async function createBuyLimit(req, res, asset, qty, price) {

    // cek dulu balance nya ada gk
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.balance < price * qty) {
        return res.status(400).json({ message: 'Balance Not Enough' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // tambahkan ke order book daftar pembeli
            const order = await tx.marketRequest.create({
                data: {
                    buyer_id: req.user.id,
                    item_id: asset,
                    price: price,
                    quantity: qty
                }
            })

            // kurangi balance user
            await tx.user.update({
                where: {
                    id: req.user.id
                },
                data: {
                    balance: user.balance - price * qty
                }
            })

            return res.json(order);
        })
    } catch (error) {
        console.log(error)

        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function createSellLimit(req, res, asset, qty, price) {

    // cek dulu punya asset nya berapa
    const userItem = await prisma.userItem.findFirst({
        where: {
            user_id: req.user.id,
            item_id: asset
        }
    })

    if (!userItem || userItem.quantity < qty) {
        return res.status(400).json({ message: 'Quantity Not Enough' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // tambah ke orderbook daftar penjual
            const order = await tx.marketListing.create({
                data: {
                    seller_id: userItem.user_id,
                    item_id: asset,
                    quantity: qty,
                    price: price
                }
            })

            // kurangi quantity asset user item
            await tx.userItem.update({
                where: {
                    id: userItem.id
                },
                data: {
                    quantity: userItem.quantity - qty
                }
            });

            return res.json(order);
        })
    } catch (error) {
        console.log(error)

        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function createBuyMarket(req, res, asset, qty) {
    // Cek dulu balance nya ada gk
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
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

    if (user.balance < ask.price * qty) {
        return res.status(400).json({ message: 'Balance Not Enough' });
    }


    try {
        await prisma.$transaction(async (tx) => {
            let remainingQty = qty

            while (remainingQty > 0) {

                // ambil ask termurah
                const ask = await tx.marketListing.findFirst({
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

                // jika gk ada penjual
                if (!ask) {
                    return res.status(200).json({ message: `Tersisa ${remainingQty} karena tidak ada penjual` });
                }

                if (remainingQty >= ask.quantity) { // jika ask dilahap semua

                    // cek sisa balance
                    const user = await tx.user.findUnique({
                        where: {
                            id: req.user.id
                        }
                    })

                    // cek jika balance kurang
                    if (user.balance < ask.price * ask.quantity) {
                        return res.status(200).json({ message: 'Tidak tereksekusi atau tereksekusi sebagian karena balance kurang dari adanya slipage' });
                    }

                    // kurangi balance user
                    await tx.user.update({
                        where: {
                            id: req.user.id
                        },
                        data: {
                            balance: user.balance - ask.price * ask.quantity
                        }
                    })

                    // tambahkan asset ke user
                    const userItem = await tx.userItem.findFirst({
                        where: {
                            user_id: req.user.id,
                            item_id: ask.item_id
                        }
                    })

                    if (userItem) {
                        await tx.userItem.update({
                            where: {
                                id: userItem.id
                            },
                            data: {
                                quantity: userItem.quantity + ask.quantity
                            }
                        })
                    } else {
                        await tx.userItem.create({
                            data: {
                                user_id: req.user.id,
                                item_id: asset,
                                quantity: ask.quantity
                            }
                        })
                    }

                    // hapus ask
                    await tx.marketListing.delete({
                        where: {
                            id: ask.id
                        }
                    })

                    // tambah balance penjual
                    const seller = await tx.user.findUnique({
                        where: {
                            id: ask.seller_id
                        }
                    })

                    await tx.user.update({
                        where: {
                            id: seller.id
                        },
                        data: {
                            balance: seller.balance + ask.price * ask.quantity
                        }
                    })

                    // catat transaksi
                    await tx.transaction.create({
                        data: {
                            buyer_id: req.user.id,
                            seller_id: seller.id,
                            item_id: asset,
                            price: ask.price,
                            quantity: ask.quantity,
                        }
                    })

                    remainingQty = remainingQty - ask.quantity

                } else if (remainingQty < ask.quantity) { // jika ask diambil sebagian
                    // cek sisa balance
                    const user = await tx.user.findUnique({
                        where: {
                            id: req.user.id
                        }
                    })

                    // cek jika balance kurang
                    if (user.balance < ask.price * remainingQty) {
                        return res.status(200).json({ message: `${remainingQty} belum tereksekusi karena balance kurang` });
                    }

                    // kurangi balance user
                    await tx.user.update({
                        where: {
                            id: req.user.id
                        },
                        data: {
                            balance: user.balance - ask.price * remainingQty
                        }
                    })

                    // tambahkan asset ke user
                    const userItem = await tx.userItem.findFirst({
                        where: {
                            user_id: req.user.id,
                            item_id: asset
                        }
                    })

                    if (userItem) {
                        await tx.userItem.update({
                            where: {
                                id: userItem.id
                            },
                            data: {
                                quantity: userItem.quantity + remainingQty
                            }
                        })
                    } else {
                        await tx.userItem.create({
                            data: {
                                user_id: req.user.id,
                                item_id: asset,
                                quantity: remainingQty
                            }
                        })
                    }

                    // kurangi quantity ask
                    await tx.marketListing.update({
                        where: {
                            id: ask.id
                        },
                        data: {
                            quantity: ask.quantity - remainingQty
                        }
                    })

                    // tambah balance penjual
                    const seller = await tx.user.findUnique({
                        where: {
                            id: ask.seller_id
                        }
                    })

                    await tx.user.update({
                        where: {
                            id: seller.id
                        },
                        data: {
                            balance: seller.balance + ask.price * remainingQty
                        }
                    })

                    // catat transaksi
                    await tx.transaction.create({
                        data: {
                            buyer_id: req.user.id,
                            seller_id: seller.id,
                            item_id: asset,
                            price: ask.price,
                            quantity: remainingQty,
                        }
                    })

                    remainingQty = 0
                }

            }

            return res.status(200).json({ message: 'Order Berhasil Tereksekusi' });
        })
    } catch (error) {
        console.log(error)

        return res.status(500).json({ message: 'Internal Server Error' });
    }

}

async function createSellMarket(req, res, asset, qty) {
    // Cek dulu qty nya ada gk
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
            user_items: {
                where: {
                    item_id: asset
                }
            }
        }
    });

    if (!user.user_items[0] || user.user_items[0].quantity < qty) {
        return res.status(400).json({ message: 'Quantity Not Enough' });
    }

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

    try {
        await prisma.$transaction(async (tx) => {
            let remainingQty = qty

            while (remainingQty > 0) {
                // ambil bid termahal
                const bid = await tx.marketRequest.findFirst({
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

                // jika gk ada pembeli
                if (!bid) {
                    return res.status(200).json({ message: `Tersisa ${remainingQty} karena tidak ada pembeli` });
                }

                if (remainingQty >= bid.quantity) { // jika bid dilahap semua
                    // cek asset user
                    const user = await tx.user.findUnique({
                        where: {
                            id: req.user.id
                        },
                        include: {
                            user_items: {
                                where: {
                                    item_id: asset
                                }
                            }
                        }
                    })

                    // kurangi asset user
                    await tx.userItem.update({
                        where: {
                            id: user.user_items[0].id
                        },
                        data: {
                            quantity: user.user_items[0].quantity - bid.quantity
                        }
                    })

                    // tambah balance user
                    await tx.user.update({
                        where: {
                            id: req.user.id
                        },
                        data: {
                            balance: user.balance + bid.price * bid.quantity
                        }
                    })

                    // tambah asset ke pembeli
                    const buyerItem = await tx.userItem.findFirst({
                        where: {
                            user_id: bid.buyer_id,
                            item_id: asset
                        }
                    })

                    if (buyerItem) {
                        await tx.userItem.update({
                            where: {
                                id: buyerItem.id
                            },
                            data: {
                                quantity: buyerItem.quantity + bid.quantity
                            }
                        })
                    } else {
                        await tx.userItem.create({
                            data: {
                                user_id: bid.buyer_id,
                                item_id: asset,
                                quantity: bid.quantity
                            }
                        })
                    }

                    // hapus bid
                    await tx.marketRequest.delete({
                        where: {
                            id: bid.id
                        }
                    })

                    // catat transaksi
                    await tx.transaction.create({
                        data: {
                            buyer_id: bid.buyer_id,
                            seller_id: req.user.id,
                            item_id: asset,
                            price: bid.price,
                            quantity: bid.quantity,
                        }
                    })

                    remainingQty = remainingQty - bid.quantity

                } else if (remainingQty < bid.quantity) { // bid diambil sebagian
                    // ambil asset user
                    const user = await tx.user.findUnique({
                        where: {
                            id: req.user.id
                        },
                        include: {
                            user_items: {
                                where: {
                                    item_id: asset
                                }
                            }
                        }
                    })

                    // kurangi asset user
                    await tx.userItem.update({
                        where: {
                            id: user.user_items[0].id
                        },
                        data: {
                            quantity: user.user_items[0].quantity - remainingQty
                        }
                    })

                    // tambah balance user
                    await tx.user.update({
                        where: {
                            id: req.user.id
                        },
                        data: {
                            balance: user.balance + bid.price * remainingQty
                        }
                    })

                    // tambah asset ke pembeli
                    const buyerItem = await tx.userItem.findFirst({
                        where: {
                            user_id: bid.buyer_id,
                            item_id: asset
                        }
                    })

                    if (buyerItem) {
                        await tx.userItem.update({
                            where: {
                                id: buyerItem.id
                            },
                            data: {
                                quantity: buyerItem.quantity + remainingQty
                            }
                        })
                    } else {
                        await tx.userItem.create({
                            data: {
                                user_id: bid.buyer_id,
                                item_id: asset,
                                quantity: remainingQty
                            }
                        })
                    }

                    // kurangi qty bid
                    await tx.marketRequest.update({
                        where: {
                            id: bid.id
                        },
                        data: {
                            quantity: bid.quantity - remainingQty
                        }
                    })

                    // catat transaksi
                    await tx.transaction.create({
                        data: {
                            buyer_id: bid.buyer_id,
                            seller_id: req.user.id,
                            item_id: asset,
                            price: bid.price,
                            quantity: remainingQty,
                        }
                    })

                    remainingQty = 0
                }

            }
        })

        return res.status(200).json({ message: 'Order Berhasil Tereksekusi' });
    } catch (error) {
        console.log(error)

        return res.status(500).json({ message: 'Internal Server Error' });
    }


}

module.exports = {
    createBuyLimit,
    createSellLimit,
    createBuyMarket,
    createSellMarket,
}