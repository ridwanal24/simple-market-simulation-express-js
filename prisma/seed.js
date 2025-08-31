const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

async function seed() {
    // User Seeder
    try {
        await prisma.user.deleteMany();
        await prisma.user.createMany({
            data: [
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
                    username: 'bot1',
                    email: 'bot1@email.com',
                    balance: 1000000,
                    password: await bcrypt.hash('password', 10)
                },
                {
                    id: 4,
                    username: 'bot2',
                    email: 'bot2@email.com',
                    balance: 1000000,
                    password: await bcrypt.hash('password', 10)
                },
            ]
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

