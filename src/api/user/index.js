const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    try {
        let token = await jwt.decode(req.cookies.jwt);
        let user = await prisma.user.findFirst({
            where: {
                id: token.id,
            }
        });
        user.password = undefined;
        return res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        return res.status(403).json({
            status: 'authorization failed',
            data: {
                message: 'invalid token',
            }
        });
    }
});
router.get('/:id', async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: 'invalid request',
            data: {
                message: 'id was not specified',
            }
        });
    }
    try {
        let user = await prisma.user.findFirst({
            where: {
                id: Number(req.params.id)
            }
        });
        if (user) {
            user.password = undefined;
            return res.status(200).json({
                status: 'success',
                data: {
                    user
                }
            });
        }
        return res.status(404).json({
            status: 'user not found',
            data: {
                message: 'this user does not exist!'
            }
        });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.error(err);
        return res.status(500).json({
            status: 'internal error',
            data: {
                message: 'error while quering database!',
            }
        });
    }
});
module.exports = router;