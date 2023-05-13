const express = require('express');
const router = express.Router();
const path = require('path');

module.exports = (url, rewrite) => {
    return (req, res, next) => {
        if (req.url == url) {
            return res.sendFile(path.join(__dirname, `../../public/${rewrite}`));
        }
        next();
    }
}