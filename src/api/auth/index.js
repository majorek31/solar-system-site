const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.get('/login', async (req, res) => {
    if (!req.query.username || !req.query.password) {
        return res.status(400).json({
            status: 'invalid request',
            data: {
                message: 'username and password must be provided!',
            }
        });
    }
    let user = await prisma.user.findFirst({
        where: {
            name: req.query.username,         
        }
    });
    if (!user) {
        return res.status(403).json({
            status: 'invalid credencials',
            data: {
                message: 'username and password are invalid!',
            }
        });
    }
    let isCorrect = await bcrypt.compare(req.query.password, user.password);
    if (!isCorrect) {
        return res.status(403).json({
            status: 'invalid credencials',
            data: {
                message: 'username and password are invalid!',
            }
        });
    }
    else {
        user.password = undefined;
        let token = await jwt.sign({id: user.id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        res.cookie('jwt', token, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false
        });
        return res.status(200).json({
            status: 'success',
            data: {
                user,
            }
        });
    }
});

router.post('/register', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            status: 'invalid request',
            data: {
                message: 'username and password must be provided!',
            }
        });
    }
    let doesUserExist = await prisma.user.findFirst({
        where: {
            name: req.body.username,
        }
    });
    if (doesUserExist) {
        return res.status(403).json({
            status: 'user exists',
            data: {
                message: 'User with this name already exists!',
            }
        });
    }
    let user = await prisma.user.create({
        data: {
            name: req.body.username,
            password: await bcrypt.hash(req.body.password, 10),
            role: 'user'
        }
    });
    let token = await jwt.sign({id: user.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT,
    });
    user.password = undefined;
    res.cookie('jwt', token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false
    });
    return res.status(200).json({
        status: 'success',
        data: {
            user,
        }
    });
});

module.exports = router;