const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

async function seed() {
    // User Seeder

    const accounts = [
        {
            id: 1,
            username: 'superadmin',
            email: 'superadmin@email.com',
            balance: 1000000,
            password: await bcrypt.hash('password', 10)
        },
        {
            id: 2,
            username: 'bandar_telur',
            email: 'bandar_telur@email.com',
            balance: 1000000,
            password: await bcrypt.hash('password', 10)
        },
        {
            id: 3,
            username: 'user',
            email: 'user@email.com',
            balance: 1000000,
            password: await bcrypt.hash('password', 10)
        },

    ]

    for (let i = 1; i <= 100; i++) {
        accounts.push({
            id: i + 3,
            username: `bot_${i}`,
            email: `bot_${i}@email.com`,
            balance: 1000000,
            password: await bcrypt.hash('password', 10)
        })
    }

    try {
        await prisma.user.deleteMany();
        await prisma.user.createMany({
            data: accounts
        })
    } catch (e) {
        console.log(e);
    }

    // Item Seeder
    try {
        await prisma.item.deleteMany();
        await prisma.item.createMany({
            data: [
                {
                    id: 1,
                    name: 'telur',
                    description: 'telur ayam dengan citarasa tinggi',
                }
            ]
        });
    } catch (error) {
        console.log(error)
    }

    // Kasih 1 juta telur ke bandar telur
    await prisma.userItem.deleteMany();
    try {
        await prisma.userItem.create({
            data: {
                user_id: 2,
                item_id: 1,
                quantity: 1000000
            }
        });
    } catch (error) {
        console.log(error)
    }
}

seed();

