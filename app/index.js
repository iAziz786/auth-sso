const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = require('../routes');
const app = express();
const publicPath = path.join(__dirname, '../public');

app.set('port', process.env.PORT);

// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "default-src 'self' feedwee.herokuapp.com");
//     return next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(logger('combined'));
app.use(express.static(publicPath));

app.use('/', router);

module.exports = app;
