const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const protectedEndpoint = require('../../middlewares/protectedEndpoint');

router.get('/', async (req, res) => {
    try {
        let posts = await prisma.post.findMany();
        return res.status(200).json({
            status: 'success',
            data: {
                size: posts.length,
                posts,
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'internal error',
            data: {
                message: 'error while getting posts from database!',
            }
        });
    }
});

router.post('/', protectedEndpoint, async (req, res) => {
    res.json({noice: true});
});

module.exports = router;