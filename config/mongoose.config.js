const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
mongoose.Promise = global.Promise;

const mainUri = process.env.MONGODB_MAIN_URI;

const mainConnection = mongoose.createConnection(mainUri, { useNewUrlParser: true });

exports.mainConnection = mainConnection;
