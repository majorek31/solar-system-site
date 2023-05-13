const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.listen(port, e => {
    if (e) throw e;
    console.log('Server listening on port ' + port);
});