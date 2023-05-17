const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const rewrite = require('./middlewares/rewriteUrl');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const protectEndpoint = require('./middlewares/protectedEndpoint');
const cors = require('cors');

dotenv.config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(rewrite('/', '/index.html'));
app.use(rewrite('/login', '/login.html'));
app.use(rewrite('/post', '/post.html'));
app.use(rewrite('/writepost', '/writepost.html'));
app.use(rewrite('/register', '/register.html'));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./api/auth'));
app.use('/api/user', protectEndpoint(), require('./api/user'));
app.use('/api/post', require('./api/post'));

app.listen(port, e => {
    if (e) throw e;
    console.log('Server listening on port ' + port);
});