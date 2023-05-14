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

module.exports = router;