const winston = require('winston');
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const config = require('config')

module.exports = function() {
    // const db = config.get('db')
    // mongoose.connect(db, { useNewUrlParser: true }) // Connect to the playground database
    // .then(() => {
    //     dbDebugger(`Connected to the $(db) database!`);
    //     winston.info(`Connected to ${db}`);
    // });
}

