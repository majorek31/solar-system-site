const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = (options) => {
    return async (req, res, next) => {
        try {
            let token = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
            if (options?.requiredRole) {
                let user = await prisma.user.findFirst({
                    where: {
                        id: token.id,
                    }
                });
                if (options?.requiredRole !== user.role) {
                    return res.status(403).json({
                        status: 'no access',
                        data: {
                            message: 'Insufficient permission',
                        }
                    });
                }
            }
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
}