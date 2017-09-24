import mongoose from 'mongoose';

import config from './constants';

mongoose.Promise = global.Promise;

try {
    mongoose.connect(config.MONGODB_URL, {
        useMongoClient: true
    });
} catch (err) {
    mongoose.createConnection(config.MONGODB_URL, {
        useMongoClient: true
    });   
}

mongoose.connection
    .once('open', () => { console.log(`MONGODB connected URL: ${config.MONGODB_URL}`); })
    .on('error', (err) => {
        throw err;
    });