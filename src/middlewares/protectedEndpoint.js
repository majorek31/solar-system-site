const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = async (req, res, next) => {
    try {
        let token = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(403).json({
            status: 'authorization failed',
            data: {
                message: 'invalid token',
            }
        });
    }
    next();
}