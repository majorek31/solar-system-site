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

router.get('/:id', async (req, res) => {
    let id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            status: 'invalid request',
            data: {
                message: 'id must be a number',
            }
        });
    }
    try {
        let post = await prisma.post.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                content: true,
                timeCreated: true,
                title: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!post) {
            return res.status(404).json({
                status: 'not found',
                data: {
                    message: 'post not found',
                }
            });
        }
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
router.delete('/:id', protectedEndpoint(), async (req, res) => {
    let id = Number(req.params.id);
    let token = await jwt.decode(req.cookies.jwt);
    if (isNaN(id)) {
        return res.status(400).json({
            status: 'invalid request',
            data: {
                message: 'id must be a number',
            }
        });
    }
    try {
        let post = await prisma.post.findUnique({
            where: { id: id },
        });
        let { role } = await prisma.user.findUnique({
            where: {
                id: token.id,
            },
            select: {
                role: true,
            },
        });
        if (!post) {
            return res.status(404).json({
                status: 'not found',
                data: {
                    message: 'post not found',
                }
            });
        }
        if (token.id !== post.author_id && role !== 'admin') {
            return res.status(403).json({
                status: 'no access',
                data: {
                    message: 'post does not belong to you!',
                }
            });
        }
        await prisma.post.delete({
            where: {
                id: id,
            },
        });
        return res.status(200).json({
            status: 'success',
            data: {
                message: 'post has been deleted',
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