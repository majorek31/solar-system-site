const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const protectedEndpoint = require('../../middlewares/protectedEndpoint');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
    try {
        let posts = await prisma.post.findMany({
            select: {
                id: true,
                title: true,
                author_id: true,
                timeCreated: true,
                content: false,
                description: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return res.status(200).json({
            status: 'success',
            data: {
                size: posts.length,
                posts,
            }
        });
    } catch (err) {
        if (err && process.env.NODE_ENV !== 'production') console.error(err);
        return res.status(500).json({
            status: 'internal error',
            data: {
                message: 'error while getting posts from database!',
            }
        });
    }
});

router.post('/', protectedEndpoint(), async (req, res) => {
    if (!req.body.title || !req.body.content || !req.body.description) {
        return res.status(400).json({
            status: 'invalid request',
            data: {
                message: 'title and content must be provided!',
            }
        });
    }
    try {
        let token = await jwt.decode(req.cookies.jwt);
        let post = await prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                author_id: token.id,
                description: req.body.description
            }
        });
        return res.status(200).json({
            status: 'success',
            data: {
                post
            }
        });
    } catch (err) {
        if (err && process.env.NODE_ENV !== 'production') console.error(err);
        return res.status(500).json({
            status: 'internal error',
            data: {
                message: 'error with database',
            }
        });
    }
});

module.exports = router;