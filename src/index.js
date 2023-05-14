const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const rewrite = require('./middlewares/rewriteUrl');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

dotenv.config();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(rewrite('/', '/index.html'));
app.use(rewrite('/login', '/login.html'));

app.use(express.static(path.join(__dirname, '../public')));

app.listen(port, e => {
    if (e) throw e;
    console.log('Server listening on port ' + port);
});